// load config from .env file
(await import('dotenv')).default.config();

// warn when hot reload commands is enabled
const HOT_RELOAD = process.env['HOT_RELOAD_COMMANDS']?.toLowerCase() === 'true';
if (HOT_RELOAD) console.warn(chalk.yellowBright('Hot reloading commands is enabled'));

// import stuff
import fs from 'node:fs'
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from 'chokidar';

import chalk from "chalk";
import { Client } from "discord.js";
import commandHandler from './commandHandling/commandHandler.js';
import { SlashCommandBuilder } from '@discordjs/builders';

// define client
let client = new Client({ intents: [] })
  .once('ready', () => console.log(chalk.greenBright('Logged in')));

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
if (HOT_RELOAD)
  // reload on file changes in the commands directory
  chokidar.watch(COMMANDS_DIRECTORY).on('change', async path => {
    if (!path.endsWith('.js')) return;
    await RELOAD();
  });

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(process.env['DISCORD_BOT_TOKEN']);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
