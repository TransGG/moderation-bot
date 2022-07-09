import type { Interaction, MessageButton, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
import type {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder
} from '@discordjs/builders';
import type InteractionHandler from './interactionHandler.js';

// I believe the any[]'s here to be unimportant, as these types are inherited before being used anywhere and code down the chain does stricter type checking. If there are any constraints on these args that I have not noticed, it'd be nice to change the any[] type to reflect that
/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* eslint-enable @typescript-eslint/no-explicit-any */

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
    ) => void | Promise<void>;

    setResponse(response: typeof this.response) {
      Reflect.set(this, 'response', response);
      return this;
    }

    public respond(interaction: Interaction, interactionHandler: InteractionHandler): void | Promise<void> {
      return this.response?.(interaction, interactionHandler, Object.freeze(this));
    }
  }
  return Responsive;
}

export { Respondable, Responsive };
