import { SlashCommandBooleanOption, SlashCommandStringOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '../../../interactionHandling/commandBuilders.js';
import TEMPLATES from '../../resources/commandTemplates.js';
import COLLECTIONS from '../../../database/collections.js';
import EMBEDS from '../../resources/embeds.js';
import type { Message } from 'discord.js';

export default await TEMPLATES.actionCommand(new ResponsiveSlashCommandSubcommandBuilder()
  .setName('message')
  .setDescription('Take moderation action on a message')
  .addBooleanOption(new SlashCommandBooleanOption()
    .setName('delete-message')
    .setDescription('Whether to delete the specified message')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('message-id')
    .setDescription('The message to take action on')
    .setRequired(true)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isCommand()) return;

    // TODO: actions
    // TODO: disallow staff members from taking action on other staff members

    let message: Message | undefined;
    try {
      message = await interaction.channel
        ?.messages.fetch(interaction.options.getString('message-id', true));
    } finally {
      if (!message) {
        await interaction.reply({ content: 'Message not found', ephemeral: true });
        return;
      }
    }

    const ACTION = interaction.options.getString('action', true);

    const REASON = interaction.options.getString('reason', true);

    const RULE = interaction.options.getString('rule', false)
      ?.split('.')
      .map(rule => Number(rule));

    const PRIVATE_NOTES = interaction.options.getString('private-notes', false);

    const TIMEOUT_DURATION = interaction.options.getInteger('timeout-duration', false) ?? undefined;
    if (interaction.options.getString('action', true) === 'timeout' && !TIMEOUT_DURATION) {
      interaction.reply({ content: 'Timeout duration must be specified', ephemeral: true });
      return;
    }

    try {
      await (await message.author.createDM()).send({
        embeds: [await EMBEDS.moderationNotice(
          await COLLECTIONS.UserLog.newLog(
            interaction.user.id,
            message.author,
            ACTION,
            REASON,
            RULE,
            PRIVATE_NOTES ?? undefined,
            TIMEOUT_DURATION,
            message
          )
        )]
      });
    } catch {
      await interaction.reply({ content: 'Could not send the notice to this user, they likely have their DMs disabled', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'Notice sent', ephemeral: true });
  }));