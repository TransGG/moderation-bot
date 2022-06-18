import TEMPLATES from '@resources/commandTemplates.js';

export default new TEMPLATES.ActionCommand('message')
  .setName('message')
  .setDescription('Take moderation action on a message');