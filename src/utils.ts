import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from 'chokidar';

import Module from "node:module";
import uGetCommands from "./utils/getCommands.js";
import uGetConfig from './utils/getConfig.js'
import uGetCustomisations from './utils/getCustomisations.js';
import uGetRules from './utils/getRules.js';

const REQUIRE = Module.createRequire(import.meta.url);
const COMMANDS_DIRECTORY = path.join(dirname(fileURLToPath(import.meta.url)), 'commands');

export function getCommands() { return uGetCommands(COMMANDS_DIRECTORY) }
export function getConfig() { return uGetConfig(REQUIRE) }
export function getCustomisations() { return uGetCustomisations(REQUIRE) }
export function getRules() { return uGetRules(REQUIRE) }

/** Adds timestamp to an import path to reimport the module */
export function t(path: string) { return `${path}?t=${Date.now()}` }
export function hotReload(reload: () => Promise<void>) {
  // reload on file changes in the commands directory
  chokidar.watch(COMMANDS_DIRECTORY).on('change', async path => {
    if (!path.endsWith('.js')) return;
    await reload();
  });
}