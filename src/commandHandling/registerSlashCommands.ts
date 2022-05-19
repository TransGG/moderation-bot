import chalk from 'chalk';
import type { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

export default async function registerSlashCommands(clientID: string | undefined, commands: SlashCommandBuilder[]) {
  if (clientID === undefined) return; // this shouldn't happen.. i think

  const REST_CLIENT = new REST({ version: '10' }).setToken(<string>process.env['DISCORD_BOT_TOKEN']);
  const GID = process.env['GUILD_ID']; // not require but allows for instantaneous slash command updates

  // send commands to discord's api
  try {
    console.log(chalk.cyanBright('Registering slash commands'));
    
    await REST_CLIENT.put(
      GID ? Routes.applicationGuildCommands(clientID, GID) : Routes.applicationCommands(clientID),
      { body: commands }
    );

    console.log(chalk.greenBright('Registered slash commands'));
  } catch (error) {
    // exit on error
    console.error(error);
    process.exit(1);
  }
}