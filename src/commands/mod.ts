import { ResponsiveSlashCommandBuilder, ResponsiveSlashCommandSubcommandBuilder } from "../commandHandling/commandBuilders.js";

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .addSubcommand(new ResponsiveSlashCommandSubcommandBuilder()
    .setName('user')
    .setDescription('Take moderation action on a user')
    .setResponse((interaction, _client, _command) => {
      if (interaction.isCommand())
        interaction.reply({ content: 'Not Implemented', ephemeral: true });
    })
  );