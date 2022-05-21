import { ResponsiveSlashCommandSubcommandBuilder } from "../../../commandHandling/commandBuilders.js";
import COLLECTIONS from "../../../database/collections.js";

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('user')
  .setDescription('Take moderation action on a user')
  .addUserOption(option => option
    .setName('user')
    .setDescription('The user to take action on')
    .setRequired(true)
  )
  .addStringOption(option => option
    .setName('reason')
    .setDescription('The reason for the action')
    .setRequired(true)
  )
  .addStringOption(option => option
    .setName("rule")
    .setDescription("The rule to apply")
    .addChoices({ name: "name", value: "value" })
    .setRequired(false)
  )
  .addStringOption(option => option
    .setName("private-notes")
    .setDescription("Private notes to add")
    .setRequired(false)
  )
  .addStringOption(option => option
    .setName('action')
    .setDescription('The action to take')
    .addChoices({ name: 'name', value: 'value' })
    .setRequired(false)
  )
  .setResponse(async (interaction, _client, _command) => {
    if (!interaction.isCommand()) return;
    await COLLECTIONS.UserLog.moderateUser(
      interaction.options.getUser('user', true),
      interaction.user.id,
      interaction.options.getString('reason', true),
      interaction.options.getString('rule') ?? undefined,
      interaction.options.getString('private-notes') ?? undefined,
      interaction.options.getString('action') ?? undefined
    )
    interaction.reply({ content: 'Done', ephemeral: true });
  });