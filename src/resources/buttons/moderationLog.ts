import { ActionRowBuilder, Client, ButtonStyle, Embed, type Interaction } from 'discord.js';
import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import EMBEDS from '@resources/embeds.js'

function get_page_info(embed: Embed) {
  const regex = /Page ([0-9]+) of ([0-9]+)/gm;

  const match = regex.exec(embed.footer?.text as string);
  if (!match) return { current_page: 0, last_page: 0 };
  return {
    current_page: Number(match[1]),
    last_page: Number(match[2])
  };
}

export async function get_log_user(client: Client, embed: Embed) {
  const regex = /> <@([0-9]+)>/gm;
  const match = regex.exec(embed.description as string);
  if (!match || !match[1]) return undefined;

  return await client.users.fetch(match[1]);
}

export function get_showing_hidden(embed: Embed) {
  const regex = /Showing Hidden: (true|false)/gm;
  const match = regex.exec(embed.footer?.text as string);
  if (!match) return false;
  return match[1] === 'true';
}


export default new ActionRowBuilder<ResponsiveMessageButton>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs First Page')
      .setEmoji({ name: '⏮️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        const this_embed = interaction.message.embeds[0] as Embed;
        const user = await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user; tell the devs');
          return;
        }

        await interaction.update({ embeds: [await EMBEDS.moderationLogs(user, get_showing_hidden(this_embed), 1)] })
        return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Previous Page')
      .setEmoji({ name: '◀️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        const this_embed = interaction.message.embeds[0] as Embed;
        const page_info = get_page_info(this_embed);
        const user = await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user. Tell the devs');
          return;
        }
        if (page_info.last_page === 0) {
          await interaction.followUp('Could not parse page numbers. Tell the devs');
          return;
        }

        page_info.current_page -= 1;
        if (page_info.current_page < 1) page_info.current_page = page_info.last_page;

        await interaction.update({
          embeds: [await EMBEDS.moderationLogs(user, get_showing_hidden(this_embed), page_info.current_page)]
        });
        return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Next Page')
      .setEmoji({ name: '▶️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        const this_embed = interaction.message.embeds[0] as Embed;
        const page_info = get_page_info(this_embed);
        const user = await get_log_user(interaction.client, this_embed);
        if (!user) {
          await interaction.followUp('Could not find the user. Tell the devs');
          return;
        }
        if (page_info.last_page === 0) {
          await interaction.followUp('Could not parse page numbers. Tell the devs');
          return;
        }

        page_info.current_page += 1;
        if (page_info.current_page > page_info.last_page) page_info.current_page = 1;

        await interaction.update({
          embeds: [await EMBEDS.moderationLogs(user, get_showing_hidden(this_embed), page_info.current_page)]
        });
        return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Mod Logs Last Page')
      // .setLabel('Last Page')
      .setEmoji({ name: '⏭️' })
      .setStyle(ButtonStyle.Primary)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;
        const this_embed = interaction.message.embeds[0] as Embed;
        const page_info = get_page_info(this_embed);
        const user = await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user. Tell the devs');
          return;
        }

        if (page_info.last_page === 0) {

          await interaction.followUp('Could not parse page numbers. Tell the devs');
          return;
        }

        await interaction.update({
          embeds: [await EMBEDS.moderationLogs(user, get_showing_hidden(this_embed), page_info.last_page)]
        });
        return;
      })
  ]);
