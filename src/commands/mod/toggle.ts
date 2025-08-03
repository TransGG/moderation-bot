import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import COLLECTIONS from '@database/collections.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js';
import { GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('toggle')
  .setDescription('Hide (remove) or unhide (re-show) an infraction from a user\'s logs')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to toggle the infraction for')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('infraction')
    .setDescription('The ID of the infraction to hide/unhide')
    .setRequired(true)
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

    const user = interaction.options.getUser('user', true);
    const infraction = interaction.options.getString('infraction', true);

    const LOGS = (await COLLECTIONS.UserLog.getUserLog(user.id)).moderationLogs;
    const LOG = LOGS[parseInt(infraction) - 1];

    if (LOG === undefined) {
      await interaction.followUp({ content: 'Infraction not found', ephemeral: true });
      return;
    }

    const actionRow = BUTTONS.toggleLog(LOG.isHidden);
    actionRow.components.forEach(i => _interactionHandler.addComponent(i));

    await interaction.followUp({
      embeds: [await EMBEDS.toggleLog(user, infraction, LOG)],
      components: [BUTTONS.toggleLog(LOG.isHidden)],
      ephemeral: true,
    });
  });
