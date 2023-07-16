// imports
import chalk from 'chalk';
import type { Client, ClientUser, Interaction, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder } from 'discord.js';
import type { ActionRowBuilder, ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {
  ResponsiveContextMenuCommandBuilder,
  ResponsiveSlashCommandBuilder,
  ResponsiveSlashCommandSubcommandBuilder,
  ResponsiveSlashCommandSubcommandGroupBuilder
} from './commandBuilders.js';
import {
  ResponsiveMessageButton,
  ResponsiveMessageSelectMenu,
  ResponsiveModal
} from './componentBuilders.js';

type Command =
  SlashCommandBuilder |
  ContextMenuCommandBuilder;

type Componenent =
  ButtonBuilder |
  StringSelectMenuBuilder |
  ModalBuilder |
  ActionRowBuilder<ButtonBuilder>;

export default class InteractionHandler {
  public readonly client: Client;
  public readonly restClient?: REST;

  public readonly commands: Command[];
  public readonly components: Componenent[] = [];

  public globalCommands = true;
  public guilds: string[] | undefined;

  /**
   * A handler to register and respond to responsive interactions
   *
   * @param client         The client to use
   * @param commands       The commands to register
   * @param globalCommands Whether to register commands globally
   * @param guilds         The guilds to register commands for if it's not globally registered, null for all guilds
   */
  public constructor(client: Client, commands: Command[], globalCommands = true, guilds?: string[]) {
    this.globalCommands = globalCommands;
    this.guilds = guilds;
    this.commands = commands;
    this.client = client
      .once('ready', async client => {
        // register slash commands after login
        Reflect.set(this, 'restClient', new REST({ version: '10' }).setToken(client.token));
        console.info(chalk.cyanBright('Registering slash commands'));
        await this.registerCommands();
        console.info(chalk.greenBright('Registered slash commands'));
        console.info(chalk.greenBright('Ready'));
      })
      .on('interactionCreate', async i => await this.respond(i));
  }

  public async respond(interaction: Interaction) {
    const COMMAND =
      interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit() ?
        this.components.find(i => {
          if ('custom_id' in i.data) return i.data.custom_id === interaction.customId;
          return false
        }) :

        interaction.isContextMenuCommand() || interaction.isChatInputCommand() ?
          this.commands.find(c => c.name === interaction.commandName) :
          undefined;
    if (!COMMAND) throw new Error(`Invalid interaction created\n${interaction}`);
    if (
      COMMAND instanceof ResponsiveContextMenuCommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandSubcommandBuilder ||
      COMMAND instanceof ResponsiveSlashCommandSubcommandGroupBuilder ||
      COMMAND instanceof ResponsiveMessageButton ||
      COMMAND instanceof ResponsiveMessageSelectMenu ||
      COMMAND instanceof ResponsiveModal
    ) await COMMAND.respond(interaction, this);
  }

  public addComponent(component: Componenent) {
    const EXISTING = this.components.find(i => {
      if ('type' in i.data && 'type' in component.data && 'custom_id' in i.data && 'custom_id' in component.data) {
        return (i.data.type === component.data.type &&
          i.data.custom_id === component.data.custom_id);
      }
      return false;
    });
    if (EXISTING) this.components.splice(this.components.indexOf(EXISTING), 1);

    this.components.push(component);
  }

  public async setCommands(commands: Command[]) {
    if (JSON.stringify(commands) !== JSON.stringify(this.commands)) {
      console.info(chalk.cyanBright('Reregistering commands'));
      await this.registerCommands();
    }
    Reflect.set(this, 'commands', commands);
    console.info(chalk.cyanBright('Reloaded commands'));
  }

  public async registerCommands() {
    if (
      !this.client.isReady() ||
      !this.restClient
    ) throw new Error('Client is not ready');

    return await Promise.all([
      this.restClient.put(
        Routes.applicationCommands(String(this.client.user?.id)),
        { body: this.globalCommands ? this.commands : [] }
      ),
      ...(this.guilds ?? this.client.guilds.cache.map(g => g.id))
        .map(gid => (<REST>this.restClient).put(
          Routes.applicationGuildCommands((<ClientUser>this.client.user).id, gid),
          { body: this.globalCommands ? [] : this.commands }
        )),
    ]);
  }
}
