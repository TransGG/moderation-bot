// import stuff
import chalk from 'chalk';
import { Client, Intents } from 'discord.js';
import InteractionHandler from './interactionHandling/interactionHandler.js';
import { getCommands, getConfig, watchAndReloadCommands } from './utils.js';
const CONFIG = await getConfig();

// define client
let client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
}).once('ready', () => console.log(chalk.greenBright('Logged in'))) as
  Client & { readonly interactionHandler: InteractionHandler };

// command handling
Reflect.set(client, 'interactionHandler', new InteractionHandler(client, await getCommands()));
if (CONFIG.Hot_Reload_Commands) watchAndReloadCommands(client.interactionHandler);

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(CONFIG.Discord_Bot_Token);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
