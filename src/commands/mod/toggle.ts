import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import COLLECTIONS from '@database/collections.js';
import EMBEDS from '@resources/embeds.js';
import BUTTONS from '@resources/buttons.js';

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

    BUTTONS.toggleLog.components.forEach(i => _interactionHandler.addComponent(i));

    const user = interaction.options.getUser('user', true);
    const infraction = interaction.options.getString('infraction', true);

    const LOGS = (await COLLECTIONS.UserLog.getUserLog(user.id)).moderationLogs;
    const LOG = LOGS[parseInt(infraction) - 1];

    if (LOG === undefined) {
      await interaction.followUp({ content: 'Infraction not found', ephemeral: true });
      return;
    }

    await interaction.followUp({
      embeds: [await EMBEDS.toggleLog(user, infraction)],
      components: [
        BUTTONS.toggleLog
      ],
      ephemeral: true
    });
  });
