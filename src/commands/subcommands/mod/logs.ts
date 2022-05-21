import { GuildMemberRoleManager } from "discord.js";
import { ResponsiveSlashCommandSubcommandBuilder } from "../../../commandHandling/commandBuilders.js";
import { getConfig } from "../../../utils.js";
import EMBEDS from "../../resources/embeds.js";

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('logs')
  .setDescription('View logs for a user')
  .addUserOption(option => option
    .setName('user')
    .setDescription('The user to view logs for')
    .setRequired(false)
  )
  .setResponse(async (interaction, _client, _command) => {
    if (!interaction.isCommand()) return;
    const CONFIG = await getConfig();

    const IS_MODERATOR = (() => {
      const USER_ROLES = interaction.member?.roles;
      if (USER_ROLES instanceof GuildMemberRoleManager) return USER_ROLES.cache.hasAny('977497126269517844');
      else if (USER_ROLES instanceof Array) return CONFIG.Moderator_Role_IDs.some(id => USER_ROLES.includes(id));
      return;
    })();

    const USER =
      (IS_MODERATOR ?
        interaction.options.getUser('user', false) :
        interaction.user) ??
      interaction.user

    interaction.reply({ embeds: [EMBEDS.moderationLogs(USER)], ephemeral: true });
  });