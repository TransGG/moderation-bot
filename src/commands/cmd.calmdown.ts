import _ from 'lodash';
import { ResponsiveSlashCommandBuilder } from '@interactionHandling/commandBuilders.js';
import MODALS from '@resources/modals.js';
import { getSnowflakeMap } from '@utils.js';
import { GuildMemberRoleManager } from 'discord.js';


export default new ResponsiveSlashCommandBuilder()
  .setName('calmdown')
  .setDescription('Give the channel a slowmode for a short while')
  .setDefaultMemberPermissions('0')
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isCommand()) return;
    _interactionHandler.addComponent(MODALS.calmdown);

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const CALMDOWN_ALLOWED =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles) :

        interaction.member?.roles instanceof Array ?
          SNOWFLAKE_MAP.Staff_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!CALMDOWN_ALLOWED) {
      await interaction.reply({
        content: CALMDOWN_ALLOWED === false ?
          'You are not allowed to calm down chat, please DM a Sr. Staff member about this' :
          'Failed to process command, please DM a bot developer about this',
        ephemeral: true
      });
      return;
    }

    const MODAL = _.cloneDeep(MODALS.calmdown);
    MODAL.components[0]?.components[0]?.setCustomId(interaction.id);

    await interaction.showModal(MODAL);
  });
