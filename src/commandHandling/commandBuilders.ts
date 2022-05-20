// imports
import type { Client, Interaction } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";

// add responses to the given class
function Responsive<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class Responsive extends Base {
    public readonly response?: (client: Client, interaction: Interaction) => void | Promise<void>;

    setResponse(response: (client: Client, interaction: Interaction) => void | Promise<void>) {
      Reflect.set(this, 'response', response);
      return this;
    }
  };
}

export class ResponsiveSlashCommandSubcommandBuilder
  extends Responsive(SlashCommandSubcommandBuilder) { };

export class ResponsiveSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
  async response(client: Client, interaction: Interaction) {
    if (interaction.isCommand()) {
      // find the subcommand and call it's response if it's responsive
      const OPTION = this.options.find(o => o.toJSON().name === interaction.options.getSubcommand());
      if (OPTION instanceof ResponsiveSlashCommandSubcommandBuilder)
        return await OPTION.response?.(client, interaction);
    }
  }
};

export class ResponsiveSlashCommandBuilder
  extends Responsive(SlashCommandBuilder) {
  async respond(client: Client, interaction: Interaction) {
    if (interaction.isCommand()) {
      // if there are no subcommands, call the response of the command and return
      if (!interaction.options.getSubcommand(false)) return await this.response?.(client, interaction);

      // find the subcommand's group or the subcommand itself if not found
      const OPTION = this.options.find(o => o.toJSON().name === (
        interaction.options.getSubcommandGroup(false) ??
        interaction.options.getSubcommand()
      ));

      // if it's responsive, call it's response
      if (
        OPTION instanceof ResponsiveSlashCommandSubcommandGroupBuilder ||
        OPTION instanceof ResponsiveSlashCommandSubcommandBuilder
      ) return await OPTION.response?.(client, interaction);
    }
  }
};