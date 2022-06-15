import type { Interaction, MessageButton, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
import type {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder
} from '@discordjs/builders';
import type InteractionHandler from './interactionHandler.js';

export type CommandConstructor =
  (new (...args: any[]) => ContextMenuCommandBuilder) |
  (new (...args: any[]) => SlashCommandBuilder) |
  (new (...args: any[]) => SlashCommandSubcommandBuilder) |
  (new (...args: any[]) => SlashCommandSubcommandGroupBuilder);

export type ComponentConstructor =
  (new (...args: any[]) => MessageButton) |
  (new (...args: any[]) => MessageSelectMenu) |
  (new (...args: any[]) => TextInputComponent) |
  (new (...args: any[]) => Modal);

type Constructor = CommandConstructor | ComponentConstructor;

function Respondable<TBase extends Constructor>(Base: TBase) {
  abstract class Respondable extends Base {
    public abstract respond(interaction: Interaction, interactionHandler: InteractionHandler): void | Promise<void>;
  }
  return Respondable;
}

function Responsive<TBase extends Constructor>(Base: TBase) {
  abstract class Responsive extends Base {
    public readonly response?: (
      interaction: Interaction,
      interactionHandler: InteractionHandler,
      command: Readonly<this>
    ) => any;

    setResponse(response: typeof this.response) {
      Reflect.set(this, 'response', response);
      return this;
    }

    public respond(interaction: Interaction, interactionHandler: InteractionHandler): any {
      return this.response?.(interaction, interactionHandler, Object.freeze(this));
    }
  }
  return Responsive;
}

export { Respondable, Responsive };