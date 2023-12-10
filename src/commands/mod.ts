import { ResponsiveSlashCommandBuilder } from '@interactionHandling/commandBuilders.js';
import { t } from '@utils.js';

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .setDefaultMemberPermissions('0')
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.user.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.message.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.logs.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.roles.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.purge.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.templateUser.js`)).default)
  .addSubcommand((await import(t`./subcommands/mod/cmd.mod.templateMessage.js`)).default);