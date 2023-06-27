import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import MODALS from '@resources/modals.js';
import { GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.User)
  .setName('Report User')
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isUserContextMenuCommand()) return;
    _interactionHandler.addComponent(MODALS.report);

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const REPORT_ALLOWED =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        !interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Report_Banned_Roles) :

        interaction.member?.roles instanceof Array ?
          !SNOWFLAKE_MAP.Report_Banned_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    // TODO: disallow reporting staff members
    // TODO: change reason button
    // TODO: disallow same user reporting the same message twice
    if (!REPORT_ALLOWED) {
      await interaction.reply({
        content: REPORT_ALLOWED === false ?
          `You are not allowed to report messages, please create a ticket in <#${SNOWFLAKE_MAP.Support_Channel}> for more info` :
          `Failed to process command, please create a ticket in <#${SNOWFLAKE_MAP.Support_Channel}> about this`,
        ephemeral: true
      });
      return;
    }

    // set the customid of the modal's text input to the message id
    const MODAL = _.cloneDeep(MODALS.report);
    MODAL.components[0]?.components[0]?.setCustomId(interaction.targetUser.id);

    await interaction.showModal(MODAL);
  });
