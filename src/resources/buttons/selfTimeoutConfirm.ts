import { ResponsiveMessageButton } from '@interactionHandling/componentBuilders.js';
import { ActionRowBuilder, ButtonStyle, type Interaction, Message } from 'discord.js';

function getConfiguration(message: Message) {
  const content = message.content;
  const hours = parseInt(content.match(/(\d+) hour/)?.[0] ?? '0');
  const showPublicly = !!content.includes('**will**');
  return { hours, showPublicly };
}

export default new ActionRowBuilder<ResponsiveMessageButton>()
  .addComponents([
    new ResponsiveMessageButton()
      .setCustomId('Self Timeout Confirm')
      .setLabel('Confirm Self-Timeout')
      .setStyle(ButtonStyle.Danger)
      .setResponse(async (interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const { hours, showPublicly } = getConfiguration(interaction.message);

        await interaction.deferUpdate();

        const member = await interaction.guild?.members.fetch(interaction.user.id); // we already checked being in a guild when handling the slash command

        if (!member) {
          await interaction.editReply({
            content: 'Could not fetch your member object (this error should not occur).',
            components: [],
          });

          return;
        }

        if (!member.manageable) {
          // this shouldn't be possible, but just in case the member becomes an admin, we don't want to throw an error
          await interaction.editReply({
            content: 'You cannot be timed out; this is unexpected unless your roles changed since you ran the command.',
            components: [],
          });

          return;
        }

        await member.timeout(hours * 60 * 60 * 1000, 'self-requested using /self-timeout');

        if (showPublicly) {
          await interaction.deleteReply().catch(() => null); // catching just in case they dismiss the message
          await interaction.channel?.send(`${interaction.user} has requested a timeout for ${hours} hour${hours === 1 ? '' : 's'} with \`/self-timeout\`.`);
        } else {
          await interaction.editReply({
            content: `You have been timed out for ${hours} hour${hours === 1 ? '' : 's'}.`,
            components: [],
          });
        }
      })
  ]);
