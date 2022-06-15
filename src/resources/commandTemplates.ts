import path from 'node:path';
import chokidar from 'chokidar';
import { getDirectoryFromFileURL, getModulesInFolder } from '@utils.js';
import ActionCommand from './commandTemplates/templates.ActionCommand.js';

const TEMPLATES = {
  ActionCommand
};

// TODO: a more centralised way to reload?
const TEMPLATES_FOLDER = path.join(getDirectoryFromFileURL(import.meta.url), 'commandTemplates');
chokidar.watch(TEMPLATES_FOLDER).on('change', async path => {
  if (!path.endsWith('.js')) return;
  (await getModulesInFolder(TEMPLATES_FOLDER)).forEach(array => 
    Reflect.set(TEMPLATES, <string>array[0].split('.')[1], array[1]));
});

export default TEMPLATES;