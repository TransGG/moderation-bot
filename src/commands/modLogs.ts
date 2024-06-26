import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js'

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.User)
  .setName('View Mod Logs')
  .setDefaultMemberPermissions('0')
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isUserContextMenuCommand()) return;
    await interaction.deferReply({ ephemeral: true });
    BUTTONS.modLogActionRow.components.forEach(i => _interactionHandler.addComponent(i));

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.targetUser, false)],
      components: [
        BUTTONS.modLogActionRow
      ],
      ephemeral: true
    });
  });
