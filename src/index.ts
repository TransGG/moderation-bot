// import stuff
import chalk from 'chalk';
import { Client, Intents } from 'discord.js';
import InteractionHandler from './interactionHandling/interactionHandler.js';
import { getCommands, getCoreConf, getSnowflakeMap, watchAndReloadCommands } from './utils.js';

const CONFIG = await getCoreConf();
const SNOWFLAKE_MAP = await getSnowflakeMap();

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
Reflect.set(client, 'interactionHandler', new InteractionHandler(
  client,
  await getCommands(),
  CONFIG.Global_Commands,
  SNOWFLAKE_MAP.Discord_Guilds ?? undefined
));

// hot reloading commands have minor performance impact for production
if (CONFIG.Hot_Reload_Commands) {
  console.warn(chalk.yellowBright('Hot Reload Commands is enabled'));
  watchAndReloadCommands(client.interactionHandler);
}

// TODO: put all strings in a file
// TODO: warning message to a channel when a message with a banned word is sent or edited
// TODO: command to send a message embed to a channel, warning to stop a discussion
// TODO: move 'src/commands/resources/' to 'src/resources/', for message event interactions

// login
console.log(chalk.cyanBright('Logging in'));
await client.login(CONFIG.Discord_Bot_Token);

// on exception
process.on('uncaughtException', e => console.error(chalk.redBright(`[unhandledException] ${e.stack ?? e}`)));
