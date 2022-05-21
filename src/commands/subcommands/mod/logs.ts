import { ResponsiveSlashCommandSubcommandBuilder } from "../../../commandHandling/commandBuilders.js";
import EMBEDS from "../../resources/embeds.js";

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('logs')
  .setDescription('View logs for a user')
  .addUserOption(option => option
    .setName('user')
    .setDescription('The user to view logs for')
    .setRequired(true)
  )
  .setResponse(async (interaction, _client, _command) => {
    if (!interaction.isCommand()) return;

    interaction.reply({
      embeds: [await EMBEDS.moderationLogs(
        interaction.options.getUser('user', true),
        true
      )],
      components: [

      ],
      ephemeral: true
    });
  });