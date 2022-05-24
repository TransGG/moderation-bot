import { Guild, Message, MessageActionRow, TextInputComponent } from "discord.js";
import { ResponsiveModal } from "../../../interactionHandling/componentBuilders.js";
import { getSnowflakeMap } from "../../../utils.js";
import EMBEDS from "../embeds.js";

// TODO: better modal layout
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
    // TODO: add to database
    await interaction.deferReply({ ephemeral: true });
    
    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const REASON = interaction.components[0]?.components[0]?.value ?? 'No reason provided';
    const MESSAGE_ID = interaction.components[0]?.components[0]?.customId as string;
    const GUILD = interaction.guild as Guild;

    try {
      const MESSAGE = await interaction.channel?.messages.fetch(MESSAGE_ID) as Message;

      await Promise.all(SNOWFLAKE_MAP.Reports_Channels.map(async id => {
        const CHANNEL = await interactionHandler.client.channels.fetch(id);
        if (!CHANNEL?.isText()) return;
        await CHANNEL.send({ embeds: [EMBEDS.messageReport(interaction.user, REASON, MESSAGE, GUILD)] });
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