import { SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('logs')
  .setDescription('View logs for a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to view logs for')
    .setRequired(true)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.options.getUser('user', true))],
      components: [
        // TODO: Buttons
      ],
      ephemeral: true
    });
    return;
  });
