// @ts-nocheck
// discord.js haven't updated their types for modals..?
import { MessageActionRow, MessageButton, TextInputComponent } from "discord.js";
import { ResponsiveModal } from "../../../interactionHandling/componentBuilders.js";

// TODO: better modal layout
export default new ResponsiveModal()
  .setCustomId('modals.report')
  .setTitle('Report Message')
  .addComponents(
    new MessageActionRow().addComponents(new TextInputComponent()
      .setCustomId('reason')
      .setLabel('Reason')
      .setStyle('SHORT')
    )
  )
  .setResponse((interaction, interactionHandler, command) => {
    if (!interaction.isModalSubmit()) return;
    // TODO: add to database
    // TODO; send report to staff channels
    interaction.reply({ content: 'Not Implemented', ephemeral: true });
  });