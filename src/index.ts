// load config from .env file
(await import('dotenv')).default.config();

// warn when hot reload commands is enabled
const HOT_RELOAD = process.env['HOT_RELOAD_COMMANDS']?.toLowerCase() === 'true';
if (HOT_RELOAD) console.warn(chalk.yellowBright('Hot reloading commands is enabled'));

// import stuff
import fs from 'node:fs'
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import chalk from "chalk";
import { Client } from "discord.js";
import commandHandler from './commandHandling/commandHandler.js';
import type { ResponsiveSlashCommandBuilder } from './commandHandling/command.js';

// define client
let client = new Client({ intents: [] })
  .once('ready', () => console.log(chalk.greenBright('Logged in')));

// handle slash commands
async function loadCommands() {
  // await for all promises in the Array<Promise<ResponsiveSlashCommandBuilder>> to be resolved
  return <ResponsiveSlashCommandBuilder[]>await Promise.all(
    // turn the url of index.js to a path
    // get the directory of the path
    // path.join(<directory of index.js>, 'commands')
    // get all files in the commands directory
    fs.readdirSync(path.join(dirname(fileURLToPath(import.meta.url)), 'commands'))
      // filter out non-js files
      .filter(file => file.endsWith('.js'))
      // add ?v=<timestamp> to the end of the file path for hot reloading
      // import the default export of the js files, this should be a ResponsiveSlashCommandBuilder
      // map() will return Array<Promise<ResponsiveSlashCommandBuilder>>
      .map(async (file) => (await import(`./commands/${file}?v=${Date.now()}`)).default)
  );
}
await commandHandler(client, HOT_RELOAD ? loadCommands : loadCommands());

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(process.env['DISCORD_BOT_TOKEN']);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
