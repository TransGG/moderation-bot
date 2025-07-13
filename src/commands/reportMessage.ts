import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContextMenuCommandBuilder } from '@interactionHandling/commandBuilders.js';
import MODALS from '@resources/modals.js';
import BUTTONS from '@resources/buttons.js';
import { GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';

export default new ResponsiveContextMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName('Report Message')
  .setDMPermission(false)
  .setResponse(async (interaction, interactionHandler, _command) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    interactionHandler.addComponent(MODALS.report);
    BUTTONS.reportActionRow.components.forEach(i => {
      interactionHandler.addComponent(i);
      console.log(i.toJSON())
    });



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
    MODAL.components[0]?.components[0]?.setCustomId(interaction.targetMessage.id);

    await interaction.showModal(MODAL);
  });
