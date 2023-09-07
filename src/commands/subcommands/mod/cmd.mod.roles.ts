import { SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import { GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';
import DROPDOWNS from '@resources/dropdowns.js';
import type { RoleInfo } from '@resources/dropdowns/dropdowns.roles.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('roles')
  .setDescription('Edit roles for a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to edit roles for')
    .setRequired(true)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isCommand()) return;
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

    const user = interaction.options.getUser('user', true);
    const member = interaction.guild?.members.cache.get(user.id);

    if (!member || !(member.roles instanceof GuildMemberRoleManager)) return

    if(!member.manageable) {
      await interaction.followUp('Unable to edit roles for this user.');
      return;
    }

    const USER_ROLES = member.roles.cache.map((role: { id: string; }) => role.id);

    const DROPDOWN_ROLES: RoleInfo[] = Object.entries(SNOWFLAKE_MAP.Mod_Editable_Roles).map(([label, role]) => {
      return {
        label,
        role,
        enabled: USER_ROLES.includes(role)
      }
    })

    await (await DROPDOWNS.modEditRoleRow(DROPDOWN_ROLES, member)).components.forEach(i => _interactionHandler.addComponent(i));

    await interaction.followUp({
      components: [
        await DROPDOWNS.modEditRoleRow(DROPDOWN_ROLES, member)
      ],
      ephemeral: true
    });
  });
