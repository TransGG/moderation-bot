import { ResponsiveSlashCommandBuilder } from '@interactionHandling/commandBuilders.js';
import { t } from '@utils.js';

export default new ResponsiveSlashCommandBuilder()
  .setName('sr-mod')
  .setDescription('Senior Moderator commands')
  .setDefaultMemberPermissions('0')
  .setDMPermission(false)
  .addSubcommand((await import(t`./sr-mod/unban.js`)).default);

