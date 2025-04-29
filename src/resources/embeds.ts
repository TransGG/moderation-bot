import path from 'node:path';
import chokidar from 'chokidar';
import { getDirectoryFromFileURL, getModulesInFolder } from '@utils.js';
import messageReport from './embeds/messageReport.js';
import userReport from './embeds/userReport.js';
import moderationLogs from './embeds/moderationLogs.js';
import moderationNotice from './embeds/moderationNotice.js';
import calmdownNotice from './embeds/calmdownNotice.js';
import editRoleNotice from './embeds/editRoleNotice.js';
import logNotice from './embeds/logNotice.js';
import purgeNotice from './embeds/purgeNotice.js';
import purgeLogs from './embeds/purgeLogs.js';
import toggleLog from './embeds/toggleLog.js';
import toggleLogNotice from './embeds/toggleLogNotice.js';
import unbanNotice from './embeds/unbanNotice.js';

const EMBEDS = {
  messageReport,
  userReport,
  moderationLogs,
  moderationNotice,
  calmdownNotice,
  editRoleNotice,
  logNotice,
  purgeNotice,
  purgeLogs,
  toggleLog,
  toggleLogNotice,
  unbanNotice,
};

// TODO: a more centralised way to reload?
const EMBEDS_FOLDER = path.join(getDirectoryFromFileURL(import.meta.url), 'embeds');
chokidar.watch(EMBEDS_FOLDER).on('change', async path => {
  if (!path.endsWith('.js')) return;
  (await getModulesInFolder(EMBEDS_FOLDER)).forEach(array =>
    Reflect.set(EMBEDS, <string>array[0].split('.')[1], array[1]));
});

export default EMBEDS;
