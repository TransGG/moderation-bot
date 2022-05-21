// import stuff
import fs from 'node:fs'
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from 'chokidar';
import { getConfig } from './utils.js';

import chalk from "chalk";
import { Client, Intents } from "discord.js";
import commandHandler from './commandHandling/commandHandler.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const CONFIG = await getConfig();
// define client
let client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS
  ]
}).once('ready', () => console.log(chalk.greenBright('Logged in')));

// handle slash commands
const COMMANDS_DIRECTORY = path.join(dirname(fileURLToPath(import.meta.url)), 'commands');
async function loadCommands() {
  // await for all promises in the Array<Promise<ResponsiveSlashCommandBuilder>> to be resolved
  return (await Promise.all(
    // get all files in the commands directory
    fs.readdirSync(COMMANDS_DIRECTORY)
      // filter out non-js files
      .filter(file => file.endsWith('.js'))
      // add ?v=<timestamp> to the end of the file path for hot reloading
      // map() will return Array<Promise<ResponsiveSlashCommandBuilder>>
      .map(async file => (await import(`./commands/${file}?v=${Date.now()}`)).default)
    // return only SlashCommandBuilders
  )).filter(module => module instanceof SlashCommandBuilder);
}

const RELOAD = await commandHandler(client, loadCommands);
if (CONFIG.Hot_Reload_Commands) {
  console.warn(chalk.yellowBright('Hot reloading commands is enabled'));
  // reload on file changes in the commands directory
  chokidar.watch(COMMANDS_DIRECTORY).on('change', async path => {
    if (!path.endsWith('.js')) return;
    await RELOAD();
  });
}

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(CONFIG.Discord_Bot_Token);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
