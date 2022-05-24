// imports
import chalk from 'chalk';
import type { Client, Interaction, MessageButton, MessageSelectMenu, Modal } from 'discord.js';
import type { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import {
  ResponsiveContentMenuCommandBuilder,
  ResponsiveSlashCommandBuilder,
  ResponsiveSlashCommandSubcommandBuilder,
  ResponsiveSlashCommandSubcommandGroupBuilder
} from './commandBuilders.js';
import {
  ResponsiveMessageButton,
  ResponsiveMessageSelectMenu,
  ResponsiveModal
} from './componentBuilders.js';
import registerCommands from './registerCommands.js';

type Command =
  SlashCommandBuilder |
  ContextMenuCommandBuilder;

type Componenent =
  MessageButton |
  MessageSelectMenu |
  Modal;

export default class InteractionHandler {
  public readonly client: Client;

  public readonly commands: Command[];
  public readonly components: Componenent[] = [];

  constructor(client: Client, commands: Command[]) {
    this.commands = commands;
    this.client = client
      .once('ready', async () => {
        // register slash commands after login
        await registerCommands(client.user?.id, commands);
        console.log(chalk.greenBright('Ready'));
      })
      .on('interactionCreate', i => this.respond(i))
  }

  async respond(interaction: Interaction) {
    const COMMAND =
      interaction.isButton() || interaction.isSelectMenu() || interaction.isModalSubmit() ?
        this.components.find(i => i.customId === interaction.customId) :

        interaction.isContextMenu() || interaction.isCommand() ?
          this.commands.find(c => c.name === interaction.commandName) :
          undefined;
    if (!COMMAND) throw new Error(`Invalid interaction created\n${interaction}`);

    if (
      COMMAND instanceof ResponsiveContentMenuCommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandSubcommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandSubcommandGroupBuilder ||
      COMMAND instanceof ResponsiveMessageButton ||
      COMMAND instanceof ResponsiveMessageSelectMenu ||
      COMMAND instanceof ResponsiveModal
    ) await COMMAND.respond(interaction, this);
  }

  addComponent(componenet: Componenent) {
    const EXISTING = this.components.find(i =>
      i.toJSON().type === componenet.toJSON().type &&
      i.customId == componenet.customId);
    if (EXISTING) this.components.splice(this.components.indexOf(EXISTING), 1)
  
    this.components.push(componenet);
  }

  async setCommands(commands: Command[]) {
    if (JSON.stringify(commands) !== JSON.stringify(this.commands))
      await registerCommands(this.client.user?.id, commands);
    Reflect.set(this, 'commands', commands);
    console.log(chalk.cyanBright('Reloaded commands'));
  }
}