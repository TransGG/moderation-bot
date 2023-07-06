import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import { GuildMemberRoleManager, GuildMember } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';
import ModUser from './subcommands/mod/cmd.mod.user.js';

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.User)
  .setName('Quick Ban User')
  .setResponse(async (interaction, _interactionHandler, _command) => {

    if (!interaction.isUserContextMenuCommand()) return;
    await interaction.deferReply({ ephemeral: true })

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const QUICK_BAN_ALLOWED =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles) :

        interaction.member?.roles instanceof Array ?
          SNOWFLAKE_MAP.Staff_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!QUICK_BAN_ALLOWED) {
      await interaction.reply({
        content: QUICK_BAN_ALLOWED === false ?
          'You are not allowed to quick ban users, please DM a Sr. Staff member about this' :
          'Failed to process command, please DM a bot developer about this',
        ephemeral: true
      });
      return;
    }

    const GUILD_MEMBER_ID = interaction.targetUser.id;

    const GUILD_MEMBER = interaction.targetMember instanceof GuildMember ? interaction.targetMember : await interaction.guild?.members.fetch(GUILD_MEMBER_ID).catch();

    if (!GUILD_MEMBER) {
      await interaction.reply({
        content: 'Failed to find the member to be banned, please check that the member is still in the server and use the normal ban command instead',
        ephemeral: true
      });
      return;
    }

    const JOINED_AT = GUILD_MEMBER.joinedAt;
    console.log(JOINED_AT);

    if (!JOINED_AT || Date.now() - JOINED_AT.getTime() > 1000 * 60 * 60 * 24 * 7) {
      await interaction.reply({
        content: 'This member joined the server too long ago to be quick banned, please use the normal ban command instead',
        ephemeral: true
      });
      return;
    }

    ModUser.response(interaction, _interactionHandler, ModUser, {
      user: GUILD_MEMBER.user,
      'action': 'ban',
      reason: 'Banned for breaking the rules in under 7 days of joining',
      rule: 'other',
      duration: '7d',
      'private-notes': 'Quick Banned Member | No Private Notes Provided'
    });
  });
