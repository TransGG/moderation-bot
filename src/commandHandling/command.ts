// imports
import type { Client, Interaction } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";

export class ResponsiveSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
  public readonly response?: (client: Client, interaction: Interaction) => void | Promise<void>;

  setResponse(response: (client: Client, interaction: Interaction) => void | Promise<void>) {
    Reflect.set(this, 'response', response);
    return this;
  }
};

export class ResponsiveSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
  public readonly respond?= async (client: Client, interaction: Interaction) => {
    if (interaction.isCommand())
      return await (<ResponsiveSlashCommandSubcommandBuilder>this.options.find(c =>
        (<SlashCommandSubcommandBuilder>c).name === interaction.options.getSubcommand()
      ))?.response?.(client, interaction);
  }
};

export class ResponsiveSlashCommandBuilder extends SlashCommandBuilder {
  public readonly response?: (client: Client, interaction: Interaction) => void | Promise<void>;

  setResponse(response: (client: Client, interaction: Interaction) => void | Promise<void>) {
    Reflect.set(this, 'response', response);
    return this;
  }
  
  async respond(client: Client, interaction: Interaction) {
    if (interaction.isCommand()) {
      if (!interaction.options.getSubcommand()) return await this.response?.(client, interaction);

      if (!interaction.options.getSubcommandGroup(false))
        return await (<ResponsiveSlashCommandSubcommandBuilder>this.options.find(c =>
          (<SlashCommandSubcommandBuilder>c).name === interaction.options.getSubcommand()
        ))?.response?.(client, interaction);

      return await (<ResponsiveSlashCommandSubcommandGroupBuilder>this.options.find(c =>
        (<SlashCommandSubcommandGroupBuilder>c).name === interaction.options.getSubcommandGroup()
      ))?.respond?.(client, interaction);
    }
  }
};