import { ResponsiveSlashCommandBuilder, ResponsiveSlashCommandSubcommandBuilder } from "../commandHandling/command.js";

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .addSubcommand(new ResponsiveSlashCommandSubcommandBuilder()
    .setName('user')
    .setDescription('Take moderation action on a user')
    .setResponse((_client, interaction) => {
      if (interaction.isCommand())
        interaction.reply({ content: 'Not Implemented', ephemeral: true });
    })
  );