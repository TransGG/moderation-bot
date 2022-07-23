import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContentMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';

export default new ResponsiveContentMenuCommandBuilder()
  .setType(ApplicationCommandType.User)
  .setName('View Mod Logs')
  .setDefaultPermission(false)
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isUserContextMenu()) return;
    await interaction.deferReply({ ephemeral: true });

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.targetUser)],
      components: [
        // TODO: Buttons
      ],
      ephemeral: true
    });

    return;
  });
