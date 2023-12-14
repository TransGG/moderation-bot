import { SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import { ChannelType, GuildMemberRoleManager, Message, TextChannel } from 'discord.js';
import { getCustomisations, getSnowflakeMap } from '@utils.js';
import { durations, sendToSrNotifyChannel } from '@resources/commandTemplates/ActionCommand.js';
import COLLECTIONS from '@database/collections.js';
import EMBEDS from '@resources/embeds.js';
import createLogFile from '../../utils/createLogFile.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('purge')
  .setDescription('Purge messages in a channel.')
  .addIntegerOption(new SlashCommandIntegerOption()
    .setName('amount')
    .setDescription('The amount of messages to purge. (Max 100)')
    .setRequired(true)
    .setMinValue(1)
    .setMaxValue(100)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('reason')
    .setDescription('The reason for purging messages.')
    .setRequired(true)
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
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand() || !interaction.channel || !(interaction.channel instanceof TextChannel)) return;
    if (!interaction.guild) return;

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

      await sendToSrNotifyChannel(interaction.client, `${SNOWFLAKE_MAP.Sr_Staff_Roles.map(u => `<@&${u}>`).join(', ')}\nModerator ${interaction.user} has exceeded their daily action limit of ${DAILY_ACTION_LIMITS} purge actions in the last 24 hours.`)

      return;
    }

    const amount = interaction.options.getInteger('amount', true);

    const user = interaction.options.getUser('user', false);

    const reason = interaction.options.getString('reason', true);

    const privateNotes = interaction.options.getString('private-notes', false);

    await COLLECTIONS.UserLog.newModLog(
      interaction.user.id,
      user ?? interaction.user,
      'purge',
      reason,
      'other',
      privateNotes ?? undefined,
      undefined,
      undefined
    );

    const channel_messages = await interaction.channel.messages.fetch({ limit: user ? 100 : amount })
    const filtered_messages = channel_messages.filter(m => m.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24 * 13)

    if (filtered_messages.size === 0) {
      await interaction.followUp({
        content: 'Unable to purge messages, no messages found that are less than 2 weeks old.',
        ephemeral: true
      });
      return;
    }

    let users = [...new Set(filtered_messages.map(m => m.author))]

    if (!user) await interaction.channel.bulkDelete(filtered_messages)
    else if (interaction.guild?.members.cache.get(user.id)) {
      const usersMessages: Message[] = []
      const channelUserMessages = filtered_messages.filter(m => m.author.id === user.id)
      channelUserMessages.forEach(msg => usersMessages.push(msg))
      users = [...new Set(channelUserMessages.map(m => m.author))]
      if (usersMessages.length > filtered_messages.size) usersMessages.splice(filtered_messages.size)
      await interaction.channel.bulkDelete(usersMessages)
    }

    await interaction.channel.send({
      embeds: [await EMBEDS.purgeNotice(users, filtered_messages.size, reason)]
    })

    const attachment = createLogFile(interaction.guild, interaction.channel, Array.from(filtered_messages.values()), users, user ?? undefined);

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
          embeds: [await EMBEDS.purgeLogs(interaction.client, interaction.user, users, reason, filtered_messages.size, privateNotes != null ? privateNotes : undefined)],
          allowedMentions: { parse: [] },
          files: [attachment]
        }).then(async msg => {
          const attachmentURL = msg.attachments.first()?.url
          if (attachmentURL) {
            msg.edit({
              embeds: [await EMBEDS.purgeLogs(interaction.client, interaction.user, users, reason, filtered_messages.size, privateNotes != null ? privateNotes : undefined, attachmentURL)],
              allowedMentions: { parse: [] },
            })
          }
        })
      } catch {
        // If sending fails, it's far more important to ignore it and do the action anyway then worry and stop
      }
    }

    await interaction.followUp({
      content: `Purged ${filtered_messages.size} messages${user ? ` from <@${user.id}>` : ''}.${channel_messages.size != filtered_messages.size ? '\n(Note: Some messages were older than 2 weeks and could not be deleted)' : ''}`,
      ephemeral: true
    });
  });
