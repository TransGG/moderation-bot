import { ActionRowBuilder, ButtonStyle, Client, Embed, type Interaction } from 'discord.js';
import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import EMBEDS from '@resources/embeds.js'
import { getSnowflakeMap } from '@utils.js';
import COLLECTIONS from '@database/collections.js';

function get_infraction(embed: Embed) {
  const regex = /Infraction ID: ([0-9]+)/gm;
  const match = regex.exec(embed.footer?.text as string);
  if (!match) return -1;
  return Number(match[1]);
}

async function get_log_user(client: Client, embed: Embed) {
  const regex = /> <@([0-9]+)>/gm;
  const match = regex.exec(embed.description as string);
  if (!match || !match[1]) return undefined;

  return await client.users.fetch(match[1]);
}

export default new ActionRowBuilder<ResponsiveMessageButton>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Hide Infraction')
      .setLabel('Hide')
      .setEmoji({ name: '🪄' })
      .setStyle(ButtonStyle.Danger)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;

        const this_embed = interaction.message.embeds[0] as Embed;
        const infraction = get_infraction(this_embed);

        if (infraction === -1) {
          await interaction.followUp('Could not find the infraction ID; tell the devs');
          return;
        }

        const user = await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user; tell the devs');
          return;
        }

        COLLECTIONS.UserLog.setHidden(user.id, infraction - 1, true);

        const SNOWFLAKE_MAP = await getSnowflakeMap();
        const sr_notify_channel = await interaction.client.channels.fetch(SNOWFLAKE_MAP.Sr_Notify_Channel);

        if (!sr_notify_channel?.isTextBased()) {
          await interaction.followUp('Could not send to sr. staff.\n' +
            'Tell the devs:\n> Badeline says the channel is not a text channel (`line 88`)');
          return;
        }

        try {
          sr_notify_channel.send({
            content: `${SNOWFLAKE_MAP.Admin_Roles.map(u => `<@&${u}>`).join(', ')}`,
            embeds: [
              await EMBEDS.toggleLogNotice(
                user,
                infraction.toString(),
                interaction.user,
              )],
            allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Admin_Roles },
          });

        } catch (e) {
          console.error(e);
          interaction.followUp('Could not notify sr. staff. Tell the devs to look around `line 60`');
          return;
        }

        await interaction.update({
          content: 'This infraction has been hidden.',
          embeds: []
        });

        return;
      }),
    new ResponsiveMessageButton()
      .setCustomId('Show Infraction')
      .setLabel('Show')
      .setEmoji({ name: '🐇' })
      .setStyle(ButtonStyle.Success)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;

        const this_embed = interaction.message.embeds[0] as Embed;
        const infraction = get_infraction(this_embed);

        if (infraction === -1) {
          await interaction.followUp('Could not find the infraction ID; tell the devs');
          return;
        }

        const user = await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp('Could not find the user; tell the devs');
          return;
        }

        COLLECTIONS.UserLog.setHidden(user.id, infraction - 1, false);

        const SNOWFLAKE_MAP = await getSnowflakeMap();
        const sr_notify_channel = await interaction.client.channels.fetch(SNOWFLAKE_MAP.Sr_Notify_Channel);

        if (!sr_notify_channel?.isTextBased()) {
          await interaction.followUp('Could not send to sr. staff.\n' +
            'Tell the devs:\n> Badeline says the channel is not a text channel (`line 88`)');
          return;
        }

        try {
          sr_notify_channel.send({
            content: `${SNOWFLAKE_MAP.Admin_Roles.map(u => `<@&${u}>`).join(', ')}`,
            embeds: [
              await EMBEDS.toggleLogNotice(
                user,
                infraction.toString(),
                interaction.user,
              )],
            allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Admin_Roles },
          });

        } catch (e) {
          console.error(e);
          interaction.followUp('Could not notify sr. staff. Tell the devs to look around `line 117`');
          return;
        }

        await interaction.update({
          content: 'This infraction has made visible.',
          embeds: []
        });

        return;
      })
  ]);
