import { ResponsiveSlashCommandBuilder } from "../commandHandling/commandBuilders.js";
import { uncachedImport } from "../utils.js";

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .addSubcommand(await uncachedImport('./commands/subcommands/mod/user.js'))
  .addSubcommand(await uncachedImport('./commands/subcommands/mod/logs.js'));