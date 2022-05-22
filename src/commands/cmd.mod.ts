import { ResponsiveSlashCommandBuilder } from "../commandHandling/commandBuilders.js";
import { t } from "../utils.js";

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .addSubcommand((await import(t('./subcommands/mod/cmd.mod.user.js'))).default)
  .addSubcommand((await import(t('./subcommands/mod/cmd.mod.logs.js'))).default);