import { ActionRowBuilder, ButtonBuilder, Client, ButtonStyle, Embed, type Interaction } from 'discord.js';
import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import BUTTONS from '@resources/buttons.js';
import EMBEDS from '@resources/embeds.js';

async function get_reported_user(client: Client, embed: Embed) {
  const regex = /https:\/\/discord\.com\/users\/([0-9]+)/gm;
  
  const match = regex.exec(embed.author?.url as string);
  if (!match || !match[1]) return undefined;

  return await client.users.fetch(match[1]);
}

export default new ActionRowBuilder<ButtonBuilder>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Report Message View Mod Logs')
      .setLabel('View Logs')
      .setEmoji({ name: '🗒' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true })

        BUTTONS.modLogActionRow.components.forEach(i => interactionHandler.addComponent(i));

        const this_embed = interaction.message.embeds[0] as Embed;
        const user = await get_reported_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user. Tell the devs');
          return;
        }

        await interaction.followUp({
          embeds: [await EMBEDS.moderationLogs(user)],
          components: [
            BUTTONS.modLogActionRow
          ],
          ephemeral: true
        });


        return;
      })
  ]);
