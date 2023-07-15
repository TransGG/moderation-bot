import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, type Interaction } from 'discord.js';
import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';

function get_page_info(embed: Embed) {
  if (!embed) return undefined;
  const regex = /Page ([0-9]+) of ([0-9]+)/gm;
  const match = regex.exec(embed.footer?.text as string);
  if (!match) return undefined;
  return {
    current_page: match[1],
    total_pages: match[2]
  };
}

export default new ActionRowBuilder<ButtonBuilder>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs First Page')
      .setLabel('First Page')
      .setEmoji({ name: '⏮️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        console.log(get_page_info(interaction.message.embeds[0] as Embed));
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Previous Page')
      .setLabel('Previous Page')
      .setEmoji({ name: '◀️' })
      .setStyle(ButtonStyle.Primary)

      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Next Page')
      .setLabel('Next Page')
      .setEmoji({ name: '▶️' })
      .setStyle(ButtonStyle.Primary)

      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Last Page')
      // .setLabel('Last Page')
      .setEmoji({ name: '⏭️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
      })
  ]);
