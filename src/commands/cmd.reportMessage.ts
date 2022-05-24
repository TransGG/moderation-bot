import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContentMenuCommandBuilder } from '../interactionHandling/commandBuilders.js';
import MODALS from './resources/modals.js';

export default new ResponsiveContentMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName('Report Message')
  .setResponse((interaction, interactionHandler, _command) => {
    if (!interaction.isMessageContextMenu()) return;
    interactionHandler.addComponent(MODALS.report);
    // TODO: disallow people with report-banned roles to report
    interaction.showModal(MODALS.report);
  });