// imports
import type { Interaction } from 'discord.js';
import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder
} from '@discordjs/builders';
import { Respondable, Responsive } from './responsiveMixins.js';
import type InteractionHandler from './interactionHandler.js';

export class ResponsiveContentMenuCommandBuilder
  extends Responsive(ContextMenuCommandBuilder) { }

export class ResponsiveSlashCommandSubcommandBuilder
  extends Responsive(SlashCommandSubcommandBuilder) { }

export class ResponsiveSlashCommandSubcommandGroupBuilder
  extends Respondable(SlashCommandSubcommandGroupBuilder) {
  public async respond(interaction: Interaction, interactionHandler: InteractionHandler) {
    if (interaction.isCommand()) {
      // find the subcommand and call it's response if it's responsive
      const OPTION = this.options.find(o => o.toJSON().name === interaction.options.getSubcommand());
      if (OPTION instanceof ResponsiveSlashCommandSubcommandBuilder)
        return await OPTION.respond?.(interaction, interactionHandler);
    }
  }
}

export class ResponsiveSlashCommandBuilder
  extends Responsive(SlashCommandBuilder) {
  public override async respond(interaction: Interaction, interactionHandler: InteractionHandler) {
    if (interaction.isCommand()) {
      // if there are no subcommands, call the response of the command and return
      if (!interaction.options.getSubcommand(false))
        return await this.response?.(interaction, interactionHandler, Object.freeze(this));

      // find the subcommand's group or the subcommand itself if not found
      const OPTION = this.options.find(o => o.toJSON().name === (
        interaction.options.getSubcommandGroup(false) ??
        interaction.options.getSubcommand()
      ));

      // if it's responsive, call its response
      if (
        OPTION instanceof ResponsiveSlashCommandSubcommandGroupBuilder ||
        OPTION instanceof ResponsiveSlashCommandSubcommandBuilder
      ) return await OPTION.respond?.(interaction, interactionHandler);
    }
  }
}