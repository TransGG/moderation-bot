import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type InteractionHandler from './interactionHandling/interactionHandler.js';

import hAddTimestamp from './utils/addTimestamp.js';
import hGetCommands from './utils/getCommands.js';
import hGetModulesInFolder from './utils/getModulesInFolder.js';
import hWatchAndReloadCommands from './utils/watchAndReloadCommands.js';
import cleanImport from 'utils/cleanImport.js';

import type advancedType from '../configs/advancedType';
import type coreType from '../configs/coreType';
import type customisationsType from '../configs/customisationsType';
import type rulesType from '../configs/rulesType';
import type snowflakeMapType from '../configs/snowflakeMapType';

/**
 * @param name The name of the config file
 * @param ext  The extension of the config file
 * @returns    The path to the config file, prioritises name.dev.extension if it exists
 */
function getConfigPath(name: string, ext: string) {
  if (!ext.startsWith('.')) ext = `.${ext}`;

  let dev_conf;
  let prod_conf;
  if (ext === '.ts') {
    dev_conf = path.join(SRC_PATH, `../dist/configs/${name}.dev.js`);
    prod_conf = path.join(SRC_PATH, `../dist/configs/${name}.js`);
  } else {
    dev_conf = path.join(SRC_PATH, `../configs/${name}.dev${ext}`);
    prod_conf = path.join(SRC_PATH, `../configs/${name}${ext}`);
  }

  const PATH = fs.existsSync(dev_conf)
    ? dev_conf
    : fs.existsSync(prod_conf)
      ? prod_conf
      : null;

  if (!PATH) throw new Error(`'${name}${ext}' not found in 'configs' folder`);

  return PATH;
}

const SRC_PATH = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIRECTORY = path.join(SRC_PATH, 'commands');
const CONFIGS = Object.freeze({
  CORE: getConfigPath('core', 'ts'),
  CUSTOMISATIONS: getConfigPath('customisations', 'ts'),
  ADVANCED: getConfigPath('advanced', 'ts'),
  RULES: getConfigPath('rules', 'ts'),
  SNOWFLAKE_MAP: getConfigPath('snowflakeMap', 'ts'),
});

export async function getCommands() {
  return await hGetCommands(COMMANDS_DIRECTORY);
}
export async function getCoreConf(): Promise<coreType> {
  return (await cleanImport(CONFIGS.CORE)).default;
}
export async function getCustomisations(): Promise<customisationsType> {
  return (await cleanImport(CONFIGS.CUSTOMISATIONS)).default;
}
export async function getAdvancedConf(): Promise<advancedType> {
  return (await cleanImport(CONFIGS.ADVANCED)).default;
}
export async function getRules(): Promise<rulesType> {
  return (await cleanImport(CONFIGS.RULES)).default;
}
export async function getSnowflakeMap(): Promise<snowflakeMapType> {
  return (await cleanImport(CONFIGS.SNOWFLAKE_MAP)).default;
}
export function getDirectoryFromFileURL(fileURL: string) {
  return dirname(fileURLToPath(fileURL));
}
export async function getModulesInFolder(directory: string) {
  return await hGetModulesInFolder(directory);
}
export function watchAndReloadCommands(interactionHandler: InteractionHandler) {
  return hWatchAndReloadCommands(interactionHandler, COMMANDS_DIRECTORY);
}

/** A template literal to add `?=<timestamp>` to a string */
// This template literal is safe with any interpolations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function t(strings: TemplateStringsArray, ...interpolations: any[]) {
  return hAddTimestamp(strings, interpolations);
}
