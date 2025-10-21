import COLLECTIONS from '@database/collections.js';
import { SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import { durations, sendToSrNotifyChannel } from '@resources/commandTemplates/ActionCommand.js';
import EMBEDS from '@resources/embeds.js';
import { getCustomisations, getSnowflakeMap } from '@utils.js';
import { ChannelType, GuildMemberRoleManager, Message, SnowflakeUtil, type GuildTextBasedChannel } from 'discord.js';
import createLogFile from '../../utils/createLogFile.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('purge')
  .setDescription('Purge messages in a channel.')
  .addStringOption(new SlashCommandStringOption()
    .setName('reason')
    .setDescription('The reason for purging messages.')
    .setRequired(true)
  )
  .addIntegerOption(new SlashCommandIntegerOption()
    .setName('amount')
    .setDescription('The amount of messages to purge.')
    .setMinValue(1)
    .setMaxValue(100)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('earliest')
    .setDescription('The ID of the least recent (topmost, first) message to purge.')
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('latest')
    .setDescription('The ID of the most recent (bottommost, last) message to purge.')
  )
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('(Optional) The user to purge messages for.')
    .setRequired(false)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('private-notes')
    .setDescription('Private notes to add')
    .setRequired(false)
  )
  .addBooleanOption(new SlashCommandBooleanOption()
    .setName('post-public-notice')
    .setDescription('Set to true to post a public notice in the affected channel')
    .setRequired(false)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand() || !interaction.channel?.isTextBased() || interaction.channel.isDMBased()) return;

    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();

    const IS_STAFF_MEMBER =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles) :

        interaction.member?.roles instanceof Array ?
          SNOWFLAKE_MAP.Staff_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!IS_STAFF_MEMBER) {
      await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const CUSTOMISATIONS = await getCustomisations()

    const DAILY_ACTION_LIMITS = CUSTOMISATIONS.Daily_Action_Limits['purge'] ?? CUSTOMISATIONS.Daily_Action_Limits['default']

    const activity = await COLLECTIONS.UserLog.checkModeratorActivityInTime(interaction.user.id, 'purge', durations.day);

    if (activity.length >= DAILY_ACTION_LIMITS) {
      await interaction.followUp({
        content:
          `Failed to perform purge action. You have performed ${activity.length} purge actions in the last 24 hours. (Limit: ${DAILY_ACTION_LIMITS})`,
        ephemeral: true,
      });

      await sendToSrNotifyChannel(interaction.client, `${SNOWFLAKE_MAP.Admin_Roles.map(u => `<@&${u}>`).join(', ')}\nModerator ${interaction.user} has exceeded their daily action limit of ${DAILY_ACTION_LIMITS} purge actions in the last 24 hours.`)

      return;
    }

    const amount = interaction.options.getInteger('amount', false);

    const earliest = interaction.options.getString('earliest', false);

    const latest = interaction.options.getString('latest', false);

    const user = interaction.options.getUser('user', false);

    const reason = interaction.options.getString('reason', true);

    const privateNotes = interaction.options.getString('private-notes', false);

    const postPublicNotice = interaction.options.getBoolean('post-public-notice', false);

    if (amount && earliest && latest) {
      await interaction.followUp({
        content: 'You cannot specify the amount of messages to purge if you also select an earliest and latest message.',
        ephemeral: true
      });

      return;
    }

    if (!(amount || earliest && latest)) {
      await interaction.followUp({
        content: 'You must either specify an amount of messages or both the earliest and latest message.',
        ephemeral: true
      });

      return;
    }

    if (user) {
      await COLLECTIONS.UserLog.newModLog(
        interaction.user.id,
        user,
        'purge',
        reason,
        'other',
        privateNotes ?? undefined,
        undefined,
        undefined
      );
    }

    const messages = await getMessagesToPurge(interaction.channel, amount, earliest, latest);
    const user_filtered_messages = user ? messages.filter(m => m.author.id === user.id) : messages;
    const filtered_messages = user_filtered_messages.filter(m => m.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24 * 14 + 10000);

    if (filtered_messages.length === 0) {
      await interaction.followUp({
        content: 'Unable to purge messages, no messages found that are less than 2 weeks old.',
        ephemeral: true
      });

      return;
    } else if (filtered_messages.length > 100) {
      await interaction.followUp({
        content: 'Unable to purge messages, too many messages were found (> 100).',
        ephemeral: true
      });

      return;
    }

    await interaction.channel.bulkDelete(filtered_messages);

    const users = [...new Set(filtered_messages.map(m => m.author))];

    if (postPublicNotice) {
      await interaction.channel.send({
        embeds: [await EMBEDS.purgeNotice(users, filtered_messages.length, reason)]
      })
    }

    const attachment = createLogFile(interaction.channel, Array.from(filtered_messages), users, user ?? undefined);

    const LOG_CHANNEL_CATEGORIES = ['purge'];

    const LOG_CHANNELS = LOG_CHANNEL_CATEGORIES.flatMap((CATEGORY) => {
      return (
        SNOWFLAKE_MAP.Mod_Logs_Channels[CATEGORY] ??
        SNOWFLAKE_MAP.Mod_Logs_Channels['default'] ??
        []
      );
    }).filter((item, index, array) => array.indexOf(item) === index);

    for (const MOD_LOG_CHANNEL of LOG_CHANNELS) {
      const LOG_CHANNEL = await interaction.client.channels.fetch(MOD_LOG_CHANNEL);

      if (
        !LOG_CHANNEL ||
        (LOG_CHANNEL.type !== ChannelType.GuildText &&
          LOG_CHANNEL.type !== ChannelType.GuildAnnouncement &&
          LOG_CHANNEL.type !== ChannelType.PublicThread &&
          LOG_CHANNEL.type !== ChannelType.PrivateThread &&
          LOG_CHANNEL.type !== ChannelType.AnnouncementThread &&
          LOG_CHANNEL.type !== ChannelType.DM)
      )
        continue;

      try {
        await LOG_CHANNEL.send({
          embeds: [await EMBEDS.purgeLogs(interaction.client, interaction.user, users, reason, filtered_messages.length, privateNotes ?? undefined)],
          allowedMentions: { parse: [] },
          files: [attachment]
        }).then(async msg => {
          const attachmentURL = msg.attachments.first()?.url
          if (attachmentURL) {
            msg.edit({
              embeds: [await EMBEDS.purgeLogs(interaction.client, interaction.user, users, reason, filtered_messages.length, privateNotes ?? undefined, attachmentURL)],
              allowedMentions: { parse: [] },
            })
          }
        })
      } catch {
        // If sending fails, it's far more important to ignore it and do the action anyway then worry and stop
      }
    }

    await interaction.followUp({
      content: `Purged ${filtered_messages.length} messages${user ? ` from <@${user.id}>` : ''}.${filtered_messages.length < user_filtered_messages.length ? '\n(Note: Some messages were older than 2 weeks and could not be deleted)' : ''}`,
      ephemeral: true
    });
  });

async function getMessagesToPurge(channel: GuildTextBasedChannel, amount: number | null, earliest: string | null, latest: string | null): Promise<Message[]> {
  const messages = earliest && latest ? [
    await channel.messages.fetch(earliest).catch(() => []),
    await channel.messages.fetch(latest).catch(() => []),
    ...(await channel.messages.fetch({ after: earliest, before: latest })).values()
  ].flat().filter(m => m.createdTimestamp <= SnowflakeUtil.timestampFrom(latest))
    : earliest && amount ? [
      await channel.messages.fetch(earliest).catch(() => []),
      ...(await channel.messages.fetch({ after: earliest, limit: amount - 1 })).values()
    ].flat() : latest && amount ? [
      await channel.messages.fetch(latest).catch(() => []),
      ...(await channel.messages.fetch({ before: latest, limit: amount - 1 })).values()
    ].flat() : amount ? [
      ...(await channel.messages.fetch({ limit: amount })).values()
    ] : [];

  return [...new Set(messages)];
}