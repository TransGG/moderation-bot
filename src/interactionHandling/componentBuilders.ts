import { ButtonBuilder } from '@discordjs/builders';
import { ModalBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Responsive } from './responsiveMixins.js';

export class ResponsiveMessageButton extends Responsive<new () => ButtonBuilder>(ButtonBuilder) { }
export class ResponsiveMessageSelectMenu extends Responsive<new () => StringSelectMenuBuilder>(StringSelectMenuBuilder) { }
export class ResponsiveModal extends Responsive<new () => ModalBuilder>(ModalBuilder) { }