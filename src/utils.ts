import Module from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type InteractionHandler from './interactionHandling/interactionHandler.js';

import hGetCommands from './utils/getCommands.js';
import hGetConfig from './utils/getConfig.js'
import hGetCustomisations from './utils/getCustomisations.js';
import hGetRules from './utils/getRules.js';
import hGetSnowflakeMap from './utils/getSnowflakeMap.js';
import hWatchAndReloadCommands from './utils/watchAndReloadCommands.js';

const REQUIRE = Module.createRequire(import.meta.url);
const CONFIG_PATH = '../resources/config.json';
const SNOWFLAKE_MAP_PATH = '../resources/snowflakeMap.json';
const COMMANDS_DIRECTORY = path.join(dirname(fileURLToPath(import.meta.url)), 'commands');

export async function getCommands() { return await hGetCommands(COMMANDS_DIRECTORY); }
export async function getConfig() { return await hGetConfig(REQUIRE, CONFIG_PATH); }
export async function getCustomisations() { return await hGetCustomisations(REQUIRE); }
export async function getRules() { return await hGetRules(REQUIRE); }
export async function getSnowflakeMap() { return await hGetSnowflakeMap(REQUIRE, SNOWFLAKE_MAP_PATH); }
export function watchAndReloadCommands(interactionHandler: InteractionHandler) {
  return hWatchAndReloadCommands(interactionHandler, COMMANDS_DIRECTORY);
}

/** Adds timestamp to an import path to reimport the module */
export function t(path: string) { return `${path}?t=${Date.now()}`; }