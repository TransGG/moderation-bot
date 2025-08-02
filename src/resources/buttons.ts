import path from 'node:path';
import chokidar from 'chokidar';
import { getDirectoryFromFileURL, getModulesInFolder } from '@utils.js';
import modLogActionRow from './buttons/moderationLog.js';
import reportActionRow from './buttons/report.js'
import toggleLog from './buttons/toggleLog.js'
import selfTimeoutConfirm from './buttons/selfTimeoutConfirm.js';

const BUTTONS = {
  modLogActionRow,
  reportActionRow,
  selfTimeoutConfirm,
  toggleLog
};

// TODO: a more centralised way to reload?
const BUTTONS_FOLDER = path.join(getDirectoryFromFileURL(import.meta.url), 'buttons');
chokidar.watch(BUTTONS_FOLDER).on('change', async path => {
  if (!path.endsWith('.js')) return;
  (await getModulesInFolder(BUTTONS_FOLDER)).forEach(array =>
    Reflect.set(BUTTONS, <string>array[0].split('.')[1], array[1]));
});

export default BUTTONS;
