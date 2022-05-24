import Module from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type InteractionHandler from './interactionHandling/interactionHandler.js';

import hGetCommands from './utils/getCommands.js';
import hGetConfig from './utils/getConfig.js'
import hGetCustomisations from './utils/getCustomisations.js';
import hGetRules from './utils/getRules.js';
import hWatchAndReloadCommands from './utils/watchAndReloadCommands.js';

const REQUIRE = Module.createRequire(import.meta.url);
const COMMANDS_DIRECTORY = path.join(dirname(fileURLToPath(import.meta.url)), 'commands');

export async function getCommands() { return await hGetCommands(COMMANDS_DIRECTORY) }
export async function getConfig() { return await hGetConfig(REQUIRE) }
export async function getCustomisations() { return await hGetCustomisations(REQUIRE) }
export async function getRules() { return await hGetRules(REQUIRE) }
export function watchAndReloadCommands(interactionHandler: InteractionHandler) {
  return hWatchAndReloadCommands(interactionHandler, COMMANDS_DIRECTORY)
}

/** Adds timestamp to an import path to reimport the module */
export function t(path: string) { return `${path}?t=${Date.now()}` }