import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js'
import type { User } from 'discord.js';

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName('View Author\'s Mod Logs')
  .setDefaultMemberPermissions('0')
  .setDMPermission(false)
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    await interaction.deferReply({ ephemeral: true });
    BUTTONS.modLogActionRow.components.forEach(i => _interactionHandler.addComponent(i));

    let user: User | null = null;

    if (interaction.targetMessage.webhookId) {
      const request = await fetch(`https://api.pluralkit.me/v2/messages/${interaction.targetId}`);
      if (request.ok) {
        const data = await request.json();
        user = await interaction.client.users.fetch(data.sender).catch(() => null);
      }
    } else {
      user = interaction.targetMessage.author;
    }

    if (!user) {
      await interaction.followUp({
        content: 'The author of this message could not be fetched. This is likely due to the author\'s account being since deleted.',
        ephemeral: true,
      });
      return;
    }

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(user, false)],
      components: [
        BUTTONS.modLogActionRow
      ],
      ephemeral: true
    });
  });
