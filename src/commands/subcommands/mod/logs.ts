import { SlashCommandUserOption } from "@discordjs/builders";
import { ResponsiveSlashCommandSubcommandBuilder } from "../../../commandHandling/commandBuilders.js";
import EMBEDS from "../../resources/embeds.js";

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('logs')
  .setDescription('View logs for a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to view logs for')
    .setRequired(true)
  )
  .setResponse(async (interaction, _client, _command) => {
    if (!interaction.isCommand()) return;

    interaction.reply({
      embeds: [await EMBEDS.moderationLogs(interaction.options.getUser('user', true))],
      components: [

      ],
      ephemeral: true
    });
  });