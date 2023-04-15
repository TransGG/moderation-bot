import { MessageButton, MessageSelectMenu, Modal } from 'discord.js';
import { Responsive } from './responsiveMixins.js';

export class ResponsiveMessageButton extends Responsive<new () => MessageButton>(MessageButton) { }
export class ResponsiveMessageSelectMenu extends Responsive<new () => MessageSelectMenu>(MessageSelectMenu) { }
export class ResponsiveModal extends Responsive<new () => Modal>(Modal) { }