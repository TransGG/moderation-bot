import fs from 'node:fs';
import Module from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type InteractionHandler from './interactionHandling/interactionHandler.js';

import hAddTimestamp from './utils/addTimestamp.js';
import hGetCommands from './utils/getCommands.js';
import hGetCoreConf from './utils/getCoreConf.js';
import hGetCustomisations from './utils/getCustomisations.js';
import hGetAdvancedConf from './utils/getAdvancedConf.js';
import hGetModulesInFolder from './utils/getModulesInFolder.js';
import hGetRules from './utils/getRules.js';
import hGetSnowflakeMap from './utils/getSnowflakeMap.js';
import hWatchAndReloadCommands from './utils/watchAndReloadCommands.js';

/**
 * @param name The name of the config file
 * @param ext  The extension of the config file
 * @returns    The path to the config file, prioritises name.dev.extension if it exists
 */
function getConfigPath(name: string, ext: string) {
  const DEV_CONF = path.join(SRC_PATH, `../configs/${name}.dev.${ext}`);
  const PROD_CONF = path.join(SRC_PATH, `../configs/${name}.${ext}`);

  const PATH =
    fs.existsSync(DEV_CONF) ? DEV_CONF :
      fs.existsSync(PROD_CONF) ? PROD_CONF :
        null;

  if (!PATH) throw new Error(`'${name}.${ext}' not found in 'configs' folder`);
  return PATH;
}

const REQUIRE = Module.createRequire(import.meta.url);
const SRC_PATH = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIRECTORY = path.join(SRC_PATH, 'commands');
const CONFIGS = Object.freeze({
  CORE: getConfigPath('core', 'json'),
  CUSTOMISATIONS: getConfigPath('customisations', 'json'),
  ADVANCED: getConfigPath('advanced', 'json'),
  RULES: getConfigPath('rules', 'json'),
  SNOWFLAKE_MAP: getConfigPath('snowflakeMap', 'json'),
});

export async function getCommands() { return await hGetCommands(COMMANDS_DIRECTORY); }
export async function getCoreConf() { return await hGetCoreConf(REQUIRE, CONFIGS.CORE); }
export async function getCustomisations() { return await hGetCustomisations(REQUIRE, CONFIGS.CUSTOMISATIONS); }
export async function getAdvancedConf() { return await hGetAdvancedConf(REQUIRE, CONFIGS.ADVANCED); }
export function getDirectoryFromFileURL(fileURL: string) { return dirname(fileURLToPath(fileURL)); }
export async function getModulesInFolder(directory: string) { return await hGetModulesInFolder(directory); }
export async function getRules() { return await hGetRules(REQUIRE, CONFIGS.RULES); }
export async function getSnowflakeMap() { return await hGetSnowflakeMap(REQUIRE, CONFIGS.SNOWFLAKE_MAP); }
export function watchAndReloadCommands(interactionHandler: InteractionHandler) {
  return hWatchAndReloadCommands(interactionHandler, COMMANDS_DIRECTORY);
}

/** A template literal to add `?=<timestamp>` to a string */
// This template literal is safe with any interpolations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function t(strings: TemplateStringsArray, ...interpolations: any[]) { return hAddTimestamp(strings, interpolations); }
