import { Guild, Message, MessageActionRow, TextInputComponent } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { ResponsiveModal } from '@interactionHandling/componentBuilders.js';
import { getSnowflakeMap } from '@utils.js';
import EMBEDS from '../embeds.js';

export default new ResponsiveModal()
  .setCustomId('modals.report')
  .setTitle('Report Message')
  .addComponents(
    // @ts-ignore, discord.js haven't updated their types for modals..?
    new MessageActionRow().addComponents(new TextInputComponent()
      // dynamic custom id, storing channel and message id
      .setLabel('Reason')
      .setPlaceholder('An explanation of why you are reporting this message in any length')
      .setStyle('PARAGRAPH')
      .setRequired(true)
    )
  )
  .setResponse(async (interaction, interactionHandler, _command) => {
    if (!interaction.isModalSubmit()) return;
    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const REASON = interaction.components[0]?.components[0]?.value ?? 'No reason provided';
    const MESSAGE_ID = interaction.components[0]?.components[0]?.customId as string;
    const GUILD = interaction.guild as Guild;

    try {
      const MESSAGE = await interaction.channel?.messages.fetch(MESSAGE_ID) as Message;
      await COLLECTIONS.UserLog.newReportLog(REASON, interaction.user, MESSAGE.author, MESSAGE);

      await Promise.all(SNOWFLAKE_MAP.Reports_Channels.map(async id => {
        const CHANNEL = await interactionHandler.client.channels.fetch(id);
        if (!CHANNEL?.isText()) return;
        await CHANNEL.send({ content: "<@&981744751520931840>", embeds: [await EMBEDS.messageReport(interaction.user, REASON, MESSAGE, GUILD)] });
      }));

      await interaction.followUp({
        content: 'Message Reported',
        ephemeral: true
      });
    } catch (e) {
      await interaction.followUp({
        content: 'Failed reporting message, please DM a staff member about this',
        ephemeral: true
      });
      throw e;
    }
  });