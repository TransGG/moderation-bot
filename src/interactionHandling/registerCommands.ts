import chalk from 'chalk';
import type { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { getConfig } from '../utils.js';

export default async function registerCommands(
  clientID: string | undefined,
  commands: (SlashCommandBuilder | ContextMenuCommandBuilder)[]
) {
  if (clientID === undefined) return; // this shouldn't happen.. i think

  const CONFIG = await getConfig();
  const REST_CLIENT = new REST({ version: '10' }).setToken(CONFIG.Discord_Bot_Token);

  // send commands to discord's api
  try {
    console.log(chalk.cyanBright('Registering slash commands'));

    const REQUESTS = CONFIG.Global_Commands ?

      [REST_CLIENT.put(
        Routes.applicationCommands(clientID),
        { body: commands }
      )] :

      CONFIG.Discord_Guild_IDs.map(gid => REST_CLIENT.put(
        Routes.applicationGuildCommands(clientID, gid),
        { body: commands }
      ));

    await Promise.all(REQUESTS);
    console.log(chalk.greenBright('Registered slash commands'));
  } catch (error) {
    // exit on error
    console.error(error);
    process.exit(1);
  }
}