// imports
import type { Client, Interaction } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";

type Builders =
  (new (...args: any[]) => SlashCommandBuilder) |
  (new (...args: any[]) => SlashCommandSubcommandBuilder) |
  (new (...args: any[]) => SlashCommandSubcommandGroupBuilder);

function Respondable<TBase extends Builders>(Base: TBase) {
  abstract class Respondable extends Base {
    public abstract respond(interaction: Interaction, client: Client): void | Promise<void>;
  }
  return Respondable;
}

// add responses to the given class
function Responsive<TBase extends Builders>(Base: TBase) {
  abstract class Responsive extends Respondable(Base) {
    public readonly response?: (interaction: Interaction, client: Client, command: Readonly<this>) => void | Promise<void>;

    setResponse(response: (interaction: Interaction, client: Client, command: Readonly<this>) => void | Promise<void>) {
      Reflect.set(this, 'response', response);
      return this;
    }
  }
  return Responsive;
}

export class ResponsiveSlashCommandSubcommandBuilder
  extends Responsive(SlashCommandSubcommandBuilder) {
  public async respond(interaction: Interaction, client: Client) {
    return await this.response?.(interaction, client, Object.freeze(this));
  }
}

export class ResponsiveSlashCommandSubcommandGroupBuilder
  extends Respondable(SlashCommandSubcommandGroupBuilder) {
  public async respond(interaction: Interaction, client: Client) {
    if (interaction.isCommand()) {
      // find the subcommand and call it's response if it's responsive
      const OPTION = this.options.find(o => o.toJSON().name === interaction.options.getSubcommand());
      if (OPTION instanceof ResponsiveSlashCommandSubcommandBuilder)
        return await OPTION.respond?.(interaction, client);
    }
  }
}

export class ResponsiveSlashCommandBuilder
  extends Responsive(SlashCommandBuilder) {
  public async respond(interaction: Interaction, client: Client) {
    if (interaction.isCommand()) {
      // if there are no subcommands, call the response of the command and return
      if (!interaction.options.getSubcommand(false)) return await this.response?.(interaction, client, Object.freeze(this));

      // find the subcommand's group or the subcommand itself if not found
      const OPTION = this.options.find(o => o.toJSON().name === (
        interaction.options.getSubcommandGroup(false) ??
        interaction.options.getSubcommand()
      ));

      // if it's responsive, call it's response
      if (
        OPTION instanceof ResponsiveSlashCommandSubcommandGroupBuilder ||
        OPTION instanceof ResponsiveSlashCommandSubcommandBuilder
      ) return await OPTION.respond?.(interaction, client);
    }
  }
}