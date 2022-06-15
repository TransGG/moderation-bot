import TEMPLATES from '@resources/commandTemplates.js';

export default new TEMPLATES.ActionCommand('user')
  .setName('user')
  .setDescription('Take moderation action on a user');