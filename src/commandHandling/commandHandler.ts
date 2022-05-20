// imports
import chalk from 'chalk';
import type { Client, Interaction } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';
import { ResponsiveSlashCommandBuilder } from './commandBuilders.js';
import registerSlashCommands from './registerSlashCommands.js';

export type SlashCommandBuildersStatic = Promise<SlashCommandBuilder[]> | SlashCommandBuilder[];
export type SlashCommandBuildersGetter = () => Promise<SlashCommandBuildersStatic> | SlashCommandBuildersStatic;
export type SlashCommandBuilders = SlashCommandBuildersStatic | SlashCommandBuildersGetter;

async function getCommands(input: SlashCommandBuilders) {
  return typeof input === 'function' ? await input() : await input;
}

async function commandHandler(client: Client, commandsOrCommandsGetter: SlashCommandBuilders) {
  // get commands
  let commands = await getCommands(commandsOrCommandsGetter);

  function respond(interaction: Interaction) {
    if (interaction.isCommand()) {
      const COMMAND = commands.find(command => command.name === interaction.commandName);
      if (COMMAND instanceof ResponsiveSlashCommandBuilder)
        return COMMAND.respond(interaction, client)
    }
    return;
  }

  client
    .once('ready', async () => {
      // register slash commands after login
      await registerSlashCommands(client.user?.id, commands);
      console.log(chalk.greenBright('Ready'));
    })
    .on('interactionCreate', respond) // slash commands and buttons
    .on('modalSubmit', respond); // modals

  return async () => {
    const NEW_COMMANDS = await getCommands(commandsOrCommandsGetter);
    if (JSON.stringify(NEW_COMMANDS) !== JSON.stringify(commands))
      await registerSlashCommands(client.user?.id, NEW_COMMANDS);
    commands = NEW_COMMANDS;
    console.log(chalk.cyanBright('Reloaded commands'));
  };
}

export default commandHandler;