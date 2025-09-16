import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import { moderationAllLogs } from '@resources/embeds/moderationLogs.js';
import { ActionRowBuilder, ButtonStyle, type Interaction } from 'discord.js';
import { get_log_user, get_showing_hidden } from './moderationLog.js';

export default new ActionRowBuilder<ResponsiveMessageButton>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Send Publicly')
      .setLabel('Send Publicly')
      .setEmoji({ name: '📢' })
      .setStyle(ButtonStyle.Danger)
      .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
        if (!interaction.isButton()) return;

        await interaction.update({
          content: 'Sending all logs publicly; you may dismiss this message.',
          embeds: [],
          components: [],
        });

        const this_embed = interaction.message.embeds[0];
        const user = this_embed && await get_log_user(interaction.client, this_embed);

        if (!user) {
          await interaction.followUp({
            content: 'Could not find the user; tell the devs',
            ephemeral: true,
          });
          return;
        }

        for (const PAGE of await moderationAllLogs(user, get_showing_hidden(this_embed), interaction.user))
          await interaction.channel?.send({ embeds: [PAGE] });

        await interaction.editReply('Successfully sent logs publicly.');
      }),
  ]);
