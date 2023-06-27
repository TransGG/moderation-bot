import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.User)
  .setName('View Mod Logs')
  .setDefaultMemberPermissions('0')
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isUserContextMenuCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.targetUser)],
      components: [
        // TODO: Buttons
      ],
      ephemeral: true
    });
  });
