import { SlashCommandIntegerOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import { GuildMemberRoleManager, Message, TextChannel } from 'discord.js';
import { getSnowflakeMap } from '@utils.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('purge')
  .setDescription('Purge messages in a channel.')
  .addIntegerOption(new SlashCommandIntegerOption()
    .setName('amount')
    .setDescription('The amount of messages to purge. (Max 100)')
    .setRequired(true)
    .setMinValue(1)
    .setMaxValue(100)
  )
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('(Optional) The user to purge messages for.')
    .setRequired(false)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand() || !interaction.channel || !(interaction.channel instanceof TextChannel)) return;

    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();

    const IS_STAFF_MEMBER =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles) :

        interaction.member?.roles instanceof Array ?
          SNOWFLAKE_MAP.Staff_Roles.some(r => (<string[]>interaction.member?.roles).includes(r)) :
          undefined;

    if (!IS_STAFF_MEMBER) {
      await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    // TODO: Add usage limits.

    const amount = interaction.options.getInteger('amount', true);

    const user = interaction.options.getUser('user', false);

    const channel_messages = await interaction.channel.messages.fetch({ limit: user ? 100 : amount })

    if (!user) await interaction.channel.bulkDelete(channel_messages)
    else if (interaction.guild?.members.cache.get(user.id)) {
      const usersMessages: Message[] = []
      channel_messages.filter(m => m.author.id === user.id).forEach(msg => usersMessages.push(msg))
      // get a max of `amount` messages from the user
      if (usersMessages.length > amount) usersMessages.splice(amount)
      await interaction.channel.bulkDelete(usersMessages)
    }

    // TODO: Save and log the channel messages that were purged to a file.
    // TODO: Send a message in the channel it was used in informing members that messages were purged.

    await interaction.followUp({
      content: `Purged ${amount} messages${user ? ` from <@${user.id}>` : ''}.`,
      ephemeral: true
    });
  });
