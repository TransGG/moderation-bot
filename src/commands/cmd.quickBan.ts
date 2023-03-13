import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContentMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import MODALS from '@resources/modals.js';
import { CommandInteraction, ContextMenuInteraction, GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';
import COLLECTIONS from '@database/collections.js';

export default new ResponsiveContentMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName('Quick Ban User')
  .setResponse(async (interaction, interactionHandler, _command) => {

    if (!interaction.isContextMenu()) return;

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


    // const TARGET = interaction.targetMessage.author

    // if (!TARGET.bannable) return await interaction.reply({
    //         content: 'This user is not bannable, if you believe this is a mistake please DM a Sr. Staff member about this',
    //         ephemeral: true
    //     });

    // const REASON = 'No reason provided. Banned Via QuickBan';
    // const DURATION = 7
    // const ACTION = 'ban';
    // const RULE = ['other'];

    // try {
    //     const bannedUser = await TARGET.ban({
    //       reason: REASON,
    //       days: DURATION,
    //     });

    //     const LOG = await COLLECTIONS.UserLog.newModLog(
    //       interaction.user.id,
    //       TARGET,
    //       ACTION,
    //       REASON,
    //       RULE,
    //       undefined,
    //       DURATION,
    //       interaction.targetMessage
    //     );
    //     await sendToLogChannel(interaction.client, TARGET, LOG, action[3]);
    //     await interaction.followUp({
    //       content: `Banned out-of-server member ${
    //         typeof bannedUser === 'object'
    //           ? `${(bannedUser as User).tag} (${bannedUser.id})`
    //           : bannedUser
    //       }`,
    //     });
    //     return;
    //   } catch (e) {
    //     console.log(`Failed to ban a user: ${e}`);
    //     await interaction.followUp({
    //       content:
    //         'I couldn\'t ban that user, check that you provided the right ID',
    //       ephemeral: true,
    //     });
    //     return;
    //   }

  });