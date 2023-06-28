import { ActionRowBuilder, Colors, EmbedBuilder, TextChannel, TextInputBuilder, time, type TextInputModalData, Message } from 'discord.js';
import { ResponsiveModal } from '@interactionHandling/componentBuilders.js';
import EMBEDS from '../embeds.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import { AuditLogEvent, TextInputStyle } from 'discord-api-types/v10';
import chalk from 'chalk';
import { getSnowflakeMap } from '@utils.js';


async function revertSlowmode(channel: TextChannel) {
  const audit = (await channel.guild?.fetchAuditLogs({
    type: AuditLogEvent.ChannelUpdate,
    limit: 5
  }
  ))?.entries;

  if (!audit) {
    console.error(chalk.redBright('Error: could not find channel edits in audit log'));
    return;
  }

  for (const [_, i] of audit) {
    const is_slowmode_change = i.changes.find(x => x.key === 'rate_limit_per_user');
    if (i.target === channel && is_slowmode_change) {
      const past_slowmode = Number(is_slowmode_change?.old); // Will always be a number (hope)

      await channel.edit({ rateLimitPerUser: past_slowmode });

      await channel.send('The slowmode has been lifted.');
      return;
    }
  }
  // Nothing was changed back
  console.error(chalk.redBright('Error: could not find slowmode changes in audit log'));
}


export default new ResponsiveModal()
  .setCustomId('modals.calmdown')
  .setTitle('Calm Down Chat')
  .addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setLabel('Reason')
        .setCustomId('modals.calmdown.reason')
        .setPlaceholder('An explanation of why you are calming down chat.\nOptional, but strongly suggested')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)),

    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setLabel('Message')
        .setCustomId('modals.calmdown.message')
        .setPlaceholder('Message that Badeline will send\nUseful if you don\'t type fast or if you want to remain anonymous')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false))
  )
  .setResponse(async (interaction, _interactionHandler: InteractionHandler, _command) => {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.inGuild()) return;
    await interaction.deferReply({ ephemeral: true });

    const slowmode_channel = interaction.channel as TextChannel;

    if (!slowmode_channel.isTextBased()) {
      interaction.followUp('The channel is not a valid text channel');
      return;
    }
    try { // mostly in case someone uses it in the one channel with 6hr slowmode
      // 10 seconds of no talking
      slowmode_channel.permissionOverwrites.create(slowmode_channel.guild.roles.everyone, { SendMessages: false });
      setTimeout(async () => {
        slowmode_channel.permissionOverwrites.create(slowmode_channel.guild.roles.everyone, { SendMessages: true });

        // Only does this after the 15 seconds of lockdown
        await slowmode_channel.edit({ rateLimitPerUser: slowmode_channel.rateLimitPerUser + 5 });
        setTimeout(revertSlowmode, 30000, slowmode_channel);

        await slowmode_channel.send(`The ${slowmode_channel.rateLimitPerUser + 5} second slowmode ` +
          `will be lifted ${time((Date.now() / 1000 | 0) + 30, 'R')}`);

      }, 15000);

    } catch (e) {
      console.error(chalk.redBright(e));
      console.log('Someone was mean to me');
    }


    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const sr_notify_channel = await interaction.client.channels.fetch(SNOWFLAKE_MAP.Sr_Notify_Channel);

    if (!sr_notify_channel?.isTextBased()) {
      await interaction.followUp('Could not send to sr. staff.\n' +
        'Tell the devs:\n> Badeline says the channel is not a text channel (`line 88`)');
      return;
    }

    let sent_message: Message;
    if ((interaction.components[1]?.components[0] as TextInputModalData).value) {
      const mod_message = (interaction.components[1]?.components[0] as TextInputModalData).value;
      sent_message = await slowmode_channel.send({
        content: '🚨 Chat has Entered Calmdown Mode 🚨',
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: 'A message from the mods',
              iconURL: String(interaction.client.user.avatarURL())
            })
            .setColor(Colors.Red)
            .setDescription(`> ${mod_message.split('\n').join('\n> ')}` + // add quotes
              `\n\nYou will be able to chat (with a slowmode) ${time((Date.now() / 1000 | 0) + 15, 'R')}`) // relative timestamp
        ]
      });
    } else {
      sent_message = await slowmode_channel.send({
        content: '🚨 Chat has Entered Calmdown Mode 🚨',
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: 'Expect a message from the mods',
              iconURL: String(interaction.client.user.avatarURL())
            })
            .setColor(Colors.Red)
            .setDescription(`\nYou will be able to chat (with a slowmode) ${time((Date.now() / 1000 | 0) + 15, 'R')}`)
        ]
      });
    }
    try {
      sr_notify_channel.send({
        content: `${SNOWFLAKE_MAP.Sr_Staff_Roles.map(u => `<@&${u}>`).join(', ')}`,
        embeds: [
          await EMBEDS.calmdownNotice(
            interaction.user,
            sent_message,
            (interaction.components[0]?.components[0] as TextInputModalData).value
          )],
        allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Sr_Staff_Roles },
      });

    } catch (e) {
      console.error(e);
      interaction.followUp('Could not notify sr. staff. Tell the devs to look around `line 153`');
      return;
    }


    interaction.followUp('Chat is being calmed down');
  });
