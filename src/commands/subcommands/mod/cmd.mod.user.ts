import { SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '../../../interactionHandling/commandBuilders.js';
import TEMPLATES from '../../resources/commandTemplates.js';
import COLLECTIONS from '../../../database/collections.js';
import EMBEDS from '../../resources/embeds.js';

export default await TEMPLATES.actionCommand(new ResponsiveSlashCommandSubcommandBuilder()
  .setName('user')
  .setDescription('Take moderation action on a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to take action on')
    .setRequired(true)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isCommand()) return;

    // TODO: actions
    // TODO: disallow staff members from taking action on other staff members

    const USER = interaction.options.getUser('user', true);

    const ACTION = interaction.options.getString('action', true);

    const REASON = interaction.options.getString('reason', true);

    const RULE = interaction.options.getString('rule', false)
      ?.split('.')
      .map(rule => Number(rule));

    const PRIVATE_NOTES = interaction.options.getString('private-notes', false);

    const TIMEOUT_DURATION = interaction.options.getInteger('timeout-duration', false) ?? undefined;
    if (ACTION === 'timeout' && !TIMEOUT_DURATION) {
      interaction.reply({ content: 'Timeout duration must be specified', ephemeral: true });
      return;
    }

    try {
      await (await USER.createDM()).send({
        embeds: [await EMBEDS.moderationNotice(
          await COLLECTIONS.UserLog.newModLog(
            interaction.user.id,
            USER,
            ACTION,
            REASON,
            RULE,
            PRIVATE_NOTES ?? undefined,
            TIMEOUT_DURATION
          )
        )]
      });
    }
    catch {
      await interaction.reply({ content: 'Could not send the notice to this user, they likely have their DMs disabled', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'Notice sent', ephemeral: true });
  }));