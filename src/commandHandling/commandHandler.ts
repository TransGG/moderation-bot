// imports
import chalk from 'chalk';
import type { Client, Interaction } from 'discord.js';
import type { ResponsiveSlashCommandBuilder } from './commandBuilders.js';
import registerSlashCommands from './registerSlashCommands.js';

export type ResponsiveSlashCommandBuildersStatic = Promise<ResponsiveSlashCommandBuilder[]> | ResponsiveSlashCommandBuilder[];
export type ResponsiveSlashCommandBuildersGetter = () => Promise<ResponsiveSlashCommandBuildersStatic> | ResponsiveSlashCommandBuildersStatic;
export type ResponsiveSlashCommandBuilders = ResponsiveSlashCommandBuildersStatic | ResponsiveSlashCommandBuildersGetter;

async function getCommands(input: ResponsiveSlashCommandBuilders) {
  return typeof input === 'function' ? await input() : await input;
}

async function commandHandler(client: Client, commandsOrCommandsGetter: ResponsiveSlashCommandBuilders) {
  // get commands
  let commands = await getCommands(commandsOrCommandsGetter);

  function respond(interaction: Interaction) {
    if (interaction.isCommand())
      return commands.find(command => command.name === interaction.commandName)?.respond?.(client, interaction);

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