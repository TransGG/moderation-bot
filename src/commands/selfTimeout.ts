import { ResponsiveSlashCommandBuilder } from '@interactionHandling/commandBuilders.js';
import { SlashCommandBooleanOption, SlashCommandIntegerOption } from '@discordjs/builders';
import BUTTONS from '@resources/buttons.js';

export default new ResponsiveSlashCommandBuilder()
  .setName('self-timeout')
  .setDescription('Give yourself a timeout between 1 and 24 hours (you will not be able to remove this)')
  .setDMPermission(false)
  .addIntegerOption(new SlashCommandIntegerOption()
    .setName('hours')
    .setDescription('the number of hours to time you out for')
    .setRequired(true)
    .setMinValue(1)
    .setMaxValue(24)
  )
  .addBooleanOption(new SlashCommandBooleanOption()
    .setName('public')
    .setDescription('if true, send a public notification that this command was used')
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;
    BUTTONS.selfTimeoutConfirm.components.forEach(i => _interactionHandler.addComponent(i));

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member) return;

    if (!member.manageable) {
      await interaction.reply({
        content: 'You cannot be timed out by the bot (your highest role is higher than the bot\'s or you are an admin).',
        ephemeral: true,
      });

      return;
    }

    const hours = interaction.options.getInteger('hours', true);
    const showPublicly = interaction.options.getBoolean('public', false) ?? false;

    await interaction.reply({
      content: `Confirm that you wish to be timed out for ${hours} hour${hours === 1 ? '' : 's'}? Staff will not undo this timeout. A public notice ${showPublicly ? '**will** be sent in this channel' : 'will **not** be sent'}.`,
      components: [BUTTONS.selfTimeoutConfirm],
      ephemeral: true,
    });
  });