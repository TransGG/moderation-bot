import { ResponsiveSlashCommandBuilder } from '@interactionHandling/commandBuilders.js';
import { t } from '@utils.js';

export default new ResponsiveSlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation command')
  .setDefaultMemberPermissions('0')
  .addSubcommand((await import(t`./mod/user.js`)).default)
  .addSubcommand((await import(t`./mod/message.js`)).default)
  .addSubcommand((await import(t`./mod/logs.js`)).default)
  .addSubcommand((await import(t`./mod/roles.js`)).default)
  .addSubcommand((await import(t`./mod/purge.js`)).default)
  .addSubcommand((await import(t`./mod/templateUser.js`)).default)
  .addSubcommand((await import(t`./mod/templateMessage.js`)).default)
  .addSubcommand((await import(t`./mod/toggle.js`)).default);

