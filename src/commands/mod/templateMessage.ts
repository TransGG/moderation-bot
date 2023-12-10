import { SlashCommandStringOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import { GuildMemberRoleManager, type APIApplicationCommandOptionChoice } from 'discord.js';
import { getSnowflakeMap, getTemplates } from '@utils.js';
import ModMessage from './message.js';

const TEMPLATES = await getTemplates();

const userTemplates: APIApplicationCommandOptionChoice<string>[] = Object.entries(TEMPLATES).filter(([, value]) => value.category.includes('user')).map(([key, value]) => {
  return {
    name: value.description,
    value: key
  }
})

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('template-message')
  .setDescription('Perform a mod action on a user using a template')
  .addStringOption(new SlashCommandStringOption()
    .setName('message-id')
    .setDescription('The message to perform the action on')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('template')
    .setDescription('The template to use')
    .setRequired(true)
    .addChoices(...userTemplates.map((action) => ({ name: action.name, value: action.value })))
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('private-notes')
    .setDescription('Private notes to add')
    .setRequired(false)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();

    const IS_STAFF_MEMBER =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles) :

        interaction.member?.roles instanceof Array ?
          SNOWFLAKE_MAP.Staff_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!IS_STAFF_MEMBER) {
      await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const selected: string = interaction.options.getString('template', true);
    const template = TEMPLATES[selected];

    if (!template) {
      await interaction.followUp({
        content: 'Failed to find template',
        ephemeral: true
      });
      return;
    }

    await ModMessage.response(interaction, _interactionHandler, ModMessage, {
      'message-id': interaction.options.getString('message-id', true),
      'delete-message': true,
      ...template,
      'private-notes': '[Performed Using Template Message]' + interaction.options.getString('private-notes', false) ? '\n' + interaction.options.getString('private-notes', false) : ''
    });

  });
