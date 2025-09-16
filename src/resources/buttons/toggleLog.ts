import { ActionRowBuilder, ButtonStyle, type Interaction } from 'discord.js';
import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import MODALS from '@resources/modals.js';

export default function toggleLog(currentlyHidden: boolean) {
  return new ActionRowBuilder<ResponsiveMessageButton>()
    .addComponents([
      new ResponsiveMessageButton()
        .setCustomId(`${currentlyHidden ? 'Show' : 'Hide'} Infraction`)
        .setLabel(currentlyHidden ? 'Show' : 'Hide')
        .setEmoji({ name: currentlyHidden ? '🐇' : '🪄' })
        .setStyle(currentlyHidden ? ButtonStyle.Success : ButtonStyle.Danger)
        .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
          if (!interaction.isButton()) return;
          _interactionHandler.addComponent(MODALS.toggleLog);
          await interaction.showModal(MODALS.toggleLog);
        }),
    ]);
}