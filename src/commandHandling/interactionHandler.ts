import { Client, Interaction, MessageButton, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';

type Interactable =
  MessageButton |
  MessageSelectMenu |
  TextInputComponent |
  Modal

type InteractableConstructor =
  (new (...args: any[]) => MessageButton) |
  (new (...args: any[]) => MessageSelectMenu) |
  (new (...args: any[]) => TextInputComponent) |
  (new (...args: any[]) => Modal)

function Responsive<TBase extends InteractableConstructor>(Base: TBase) {
  return class Responsive extends Base {
    public readonly response?: (interaction: Interaction, client: Client, command: Readonly<this>) => void | Promise<void>;

    setResponse(response: (interaction: Interaction, client: Client, command: Readonly<this>) => void | Promise<void>) {
      Reflect.set(this, 'response', response);
      return this;
    }
  }
}

const INTERACTABLES: (InstanceType<ReturnType<typeof Responsive>>)[] = [];

export default async function handleInteractable(interactable: Interactable) {
  const ResponsiveInteractable =
    interactable instanceof MessageButton ? Responsive(MessageButton) :
      interactable instanceof MessageSelectMenu ? Responsive(MessageSelectMenu) :
        interactable instanceof TextInputComponent ? Responsive(TextInputComponent) :
          interactable instanceof Modal ? Responsive(Modal) :
            null;
  if (!ResponsiveInteractable) throw new Error('Invalid interactable');

  const EXISTING = INTERACTABLES.find(i =>
    i instanceof Object.getPrototypeOf(interactable).constructor &&
    i.customId == interactable.customId);
  if (EXISTING) INTERACTABLES.splice(INTERACTABLES.indexOf(EXISTING), 1)

  const INTERACTABLE = Object.setPrototypeOf(interactable, ResponsiveInteractable.prototype);
  INTERACTABLES.push(INTERACTABLE);

  return INTERACTABLE;
}