import path from 'node:path';
import chokidar from 'chokidar';
import { getDirectoryFromFileURL, getModulesInFolder } from '@utils.js';
import modEditRoleRow from './dropdowns/roles.js';

const DROPDOWNS = {
  modEditRoleRow
};

// TODO: a more centralised way to reload?
const DROPDOWNS_FOLDER = path.join(getDirectoryFromFileURL(import.meta.url), 'dropdowns');
chokidar.watch(DROPDOWNS_FOLDER).on('change', async path => {
  if (!path.endsWith('.js')) return;
  (await getModulesInFolder(DROPDOWNS_FOLDER)).forEach(array =>
    Reflect.set(DROPDOWNS, <string>array[0].split('.')[1], array[1]));
});

export default DROPDOWNS;
