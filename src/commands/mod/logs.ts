import { SlashCommandUserOption, SlashCommandBooleanOption} from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js';
import { GuildMemberRoleManager, type Channel } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('logs')
  .setDescription('View logs for a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to view logs for')
    .setRequired(true)
  )
  .addBooleanOption(new SlashCommandBooleanOption()
    .setName('show-hidden')
    .setDescription('Show the hidden logs for the user')
    .setRequired(false)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const ANY_SERVER_STAFF_ROLES = [...SNOWFLAKE_MAP.Staff_Roles, ...SNOWFLAKE_MAP.Staff_Server_Staff_Roles];

    const IS_STAFF_MEMBER =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...ANY_SERVER_STAFF_ROLES) :

        interaction.member?.roles instanceof Array ?
          ANY_SERVER_STAFF_ROLES.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!IS_STAFF_MEMBER) {
      await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    let SHOW_SEND_PUBLICLY_BUTTON = false;

    let current: Channel | null = interaction.channel;

    while (current) {
      if (SNOWFLAKE_MAP.Allow_Public_Mod_Logs_Channels.includes(current.id)) {
        SHOW_SEND_PUBLICLY_BUTTON = true;
        break;
      }

      current = current.isDMBased() ? null : current.parent;
    }

    BUTTONS.modLogActionRow.components.forEach(i => _interactionHandler.addComponent(i));
    if (SHOW_SEND_PUBLICLY_BUTTON) BUTTONS.sendPubliclyButton.components.forEach(i => _interactionHandler.addComponent(i));

    await interaction.followUp({
      embeds: [await EMBEDS.moderationLogs(interaction.options.getUser('user', true), interaction.options.getBoolean('show-hidden', false) || false)],
      components: [
        BUTTONS.modLogActionRow,
        ...(SHOW_SEND_PUBLICLY_BUTTON ? [BUTTONS.sendPubliclyButton] : []),
      ],
      ephemeral: true
    });
  });
