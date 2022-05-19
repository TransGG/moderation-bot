// imports
import chalk from 'chalk';
import type { Client, Interaction } from 'discord.js';
import type { ResponsiveSlashCommandBuilder } from './command.js';
import registerSlashCommands from './registerSlashCommands.js';

type ResponsiveSlashCommandBuilders = Promise<ResponsiveSlashCommandBuilder[]> | ResponsiveSlashCommandBuilder[];
type ResponsiveSlashCommandBuildersGetter = () => Promise<ResponsiveSlashCommandBuilders> | ResponsiveSlashCommandBuilders;

async function commandHandler(client: Client, commands: ResponsiveSlashCommandBuilders): Promise<Client>;
async function commandHandler(client: Client, commandsGetter: ResponsiveSlashCommandBuildersGetter): Promise<Client>;
async function commandHandler(
  client: Client,
  commandsOrCommandsGetter:
    ResponsiveSlashCommandBuilders |
    ResponsiveSlashCommandBuildersGetter
): Promise<Client>;

async function commandHandler(
  client: Client,
  commandsOrCommandsGetter:
    ResponsiveSlashCommandBuilders |
    ResponsiveSlashCommandBuildersGetter
) {
  // get commands
  let commands = typeof commandsOrCommandsGetter === 'function' ? await commandsOrCommandsGetter() : await commandsOrCommandsGetter;

  function respond(interaction: Interaction) {
    if (interaction.isCommand())
      commands.find(command => command.name === interaction.commandName)?.respond?.(client, interaction);
  }

  return client
    .once('ready', async () => {
      // register slash commands after login
      await registerSlashCommands(client.user?.id, commands);
      console.log(chalk.greenBright('Ready'));
    })
    .on('interactionCreate', respond) // slash commands and buttons
    .on('modalSubmit', respond); // modals
}

export default commandHandler;