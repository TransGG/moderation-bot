import { Guild, GuildMember, Message, ActionRowBuilder, TextInputBuilder, type TextInputModalData } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { ResponsiveModal } from '@interactionHandling/componentBuilders.js';
import { getSnowflakeMap } from '@utils.js';
import EMBEDS from '../embeds.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import { ChannelType, TextInputStyle } from 'discord-api-types/v10';

export default new ResponsiveModal()
  .setCustomId('modals.report')
  .setTitle('Report Message')
  .addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
      // dynamic custom id, storing channel and message id
      .setLabel('Reason')
      .setPlaceholder('An explanation of why you are reporting this message in any length')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    )
  )
  .setResponse(async (interaction, interactionHandler: InteractionHandler, _command) => {
    if (!interaction.isModalSubmit()) return;
    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const text_input = interaction.components[0]?.components[0] as TextInputModalData;
    const REASON = text_input.value ?? 'No reason provided';
    const CUSTOM_ID = text_input.customId as string;
    const GUILD = interaction.guild as Guild;

    try {
      let MESSAGE: Message | undefined
      let MEMBER: GuildMember | undefined
      try {
        MESSAGE = await interaction.channel?.messages.fetch(CUSTOM_ID) as Message;
      } catch {
        // If the report is just a user
        // Shouldn't get any false positives since message IDs are longer than user IDs
        MEMBER = (await interaction.guild?.members.fetch(CUSTOM_ID)) as GuildMember;
      }

      if (MESSAGE) {
        await COLLECTIONS.UserLog.newReportLog(REASON, interaction.user, MESSAGE.author, MESSAGE);

        await Promise.all(SNOWFLAKE_MAP.Reports_Channels.map(async id => {
          const CHANNEL = await interactionHandler.client.channels.fetch(id);
          if (!CHANNEL?.isTextBased()) return;
          const reportLog = await CHANNEL.send({
            content: SNOWFLAKE_MAP.Report_Notification_Roles.map(r => `<@&${r}>`).join('\n'),
            embeds: [await EMBEDS.messageReport(interaction.user, REASON, MESSAGE!, GUILD)]
          });
          await reportLog.react('👍');
        }));

        await interaction.followUp({
          content: 'Message Reported',
          ephemeral: true
        });
      } else if (MEMBER) {
        await COLLECTIONS.UserLog.newReportLog(REASON, interaction.user, MEMBER!.user);

        await Promise.all(SNOWFLAKE_MAP.Reports_Channels.map(async id => {
          const CHANNEL = await interactionHandler.client.channels.fetch(id);
          if (!CHANNEL?.isTextBased()) return;
          const reportLog = await CHANNEL.send({
            content: SNOWFLAKE_MAP.Report_Notification_Roles.map(r => `<@&${r}>`).join('\n'),
            embeds: [await EMBEDS.userReport(interaction.user, REASON, MEMBER!.user, MEMBER!.voice)]
          });
          await reportLog.react('👍');
        }));

        if (interaction.channel?.type == ChannelType.GuildVoice) {
          await interaction.user.send('Thank you for reporting this user. The staff will take action shortly');
        }

        await interaction.followUp({
          content: 'User Reported',
          ephemeral: true
        });

      }

    } catch (e) {
      await interaction.followUp({
        content: `Failed reporting, please create a ticket in <#${SNOWFLAKE_MAP.Support_Channel}> about this`,
        ephemeral: true
      });

      // If the report message is too long, it will fail checking if it's a VC channel for some reason
      await interaction.user.send(
        `Failed reporting, please create a ticket in <#${SNOWFLAKE_MAP.Support_Channel}> about this`);

      throw e;
    }
  });
