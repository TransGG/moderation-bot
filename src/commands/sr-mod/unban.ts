import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import EMBEDS from '@resources/embeds.js';
import { getSnowflakeMap } from '@utils.js';
import chalk from 'chalk';
import { GuildMemberRoleManager } from 'discord.js';

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('unban')
  .setDescription('Unban a user from the server')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to unban')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('reason')
    .setDescription('The reason this user is being unbanned')
    .setRequired(true)
    .setMaxLength(256)
  )
  .setResponse(async (interaction, _interactionHandler, _command) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;

    await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();

    const IS_SR_STAFF_MEMBER =
      interaction.member?.roles instanceof GuildMemberRoleManager ?
        interaction.member.roles.cache.hasAny(...SNOWFLAKE_MAP.Sr_Staff_Roles) :
        interaction.member?.roles?.some(r => (<string[]>interaction.member?.roles).includes(r)) ?? false;

    if (!IS_SR_STAFF_MEMBER) {
      await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user', true);

    if (!await interaction.guild.bans.fetch(user).catch(() => null)) {
      await interaction.followUp({ content: 'This user is not banned.', ephemeral: true });
      return;
    }

    const reason = interaction.options.getString('reason', true);

    await interaction.guild.bans.remove(user, reason).catch((error) => {
      interaction.followUp('Failed to unban user. Please check the console logs.');
      console.error(chalk.redBright(error));
      return;
    });

    await interaction.followUp({ content: `Successfully unbanned ${user.tag}.`, ephemeral: true });

    const LOG_CHANNELS = SNOWFLAKE_MAP.Mod_Logs_Channels['ban'] ?? SNOWFLAKE_MAP.Mod_Logs_Channels['default'] ?? [];

    let notified = false;

    for (const MOD_LOG_CHANNEL of LOG_CHANNELS) {
      const LOG_CHANNEL = await interaction.client.channels.fetch(MOD_LOG_CHANNEL).catch(() => null);
      if (!LOG_CHANNEL?.isTextBased()) continue;

      await LOG_CHANNEL.send({
        content: notified ? '' : SNOWFLAKE_MAP.Admin_Roles.map(u => `<@&${u}>`).join(' '),
        embeds: [await EMBEDS.unbanNotice(user, interaction.user, reason)],
        allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Admin_Roles },
      });

      notified = true;
    }
  })