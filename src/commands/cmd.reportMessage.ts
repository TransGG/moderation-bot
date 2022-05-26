import _ from 'lodash';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ResponsiveContentMenuCommandBuilder } from '../interactionHandling/commandBuilders.js';
import MODALS from './resources/modals.js';
import { GuildMemberRoleManager } from 'discord.js';
import { getSnowflakeMap } from '../utils.js';

export default new ResponsiveContentMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName('Report Message')
  .setResponse(async (interaction, interactionHandler, _command) => {
    if (!interaction.isMessageContextMenu()) return;
    interactionHandler.addComponent(MODALS.report);
    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const REPORT_ALLOWED =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        !interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Report_Banned_Roles) :

        interaction.member?.roles instanceof Array ?
          !SNOWFLAKE_MAP.Report_Banned_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!REPORT_ALLOWED) {
      await interaction.reply({
        content: REPORT_ALLOWED === false ?
          'You are not allowed to report messages, please DM a staff member for more info' :
          'Failed to process command, please DM a staff member about this',
        ephemeral: true
      });
      return;
    }

    const MODAL = _.cloneDeep(MODALS.report);
    MODAL.components[0]?.components[0]?.setCustomId(interaction.targetMessage.id);

    await interaction.showModal(MODAL);
  });