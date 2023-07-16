import { SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js';

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
    BUTTONS.modLogActionRow.components.forEach(i => _interactionHandler.addComponent(i));



    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.options.getUser('user', true))],
      components: [
        BUTTONS.modLogActionRow
      ],
      ephemeral: true
    });
  });
