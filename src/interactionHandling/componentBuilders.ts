import { MessageButton, MessageSelectMenu, Modal } from 'discord.js';
import { Responsive } from './responsiveMixins.js';

export class ResponsiveMessageButton extends Responsive(MessageButton) { }
export class ResponsiveMessageSelectMenu extends Responsive(MessageSelectMenu) { }
export class ResponsiveModal extends Responsive(Modal) { }