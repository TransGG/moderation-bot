// import stuff
import chalk from "chalk";
import { Client } from "discord.js";
import commandHandler from './commandHandling/commandHandler.js';
import { getCommands, getConfig, hotReload } from './utils.js';
const CONFIG = await getConfig();

// define client
let client = new Client({ intents: [] })
  .once('ready', () => console.log(chalk.greenBright('Logged in')));

// handle slash commands
const RELOAD = await commandHandler(client, getCommands);
if (CONFIG.Hot_Reload_Commands) {
  console.warn(chalk.yellowBright('Hot reloading commands is enabled'));
  hotReload(RELOAD)
}

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(CONFIG.Discord_Bot_Token);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
