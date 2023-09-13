import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, GuildMember, type Interaction, userMention, ChannelType } from 'discord.js';
import { ResponsiveMessageSelectMenu } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import { getSnowflakeMap } from '@utils.js';
import EMBEDS from '@resources/embeds.js';
export interface RoleInfo {
  label: string;
  role: string;
  enabled: boolean;
}

const SNOWFLAKE_MAP = await getSnowflakeMap();

export default async function modEditRoleRow(roles: RoleInfo[], member: GuildMember) {
  const DROPDOWN = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents([
      new ResponsiveMessageSelectMenu()
        .setCustomId('User Roles Select Menu')
        .setMinValues(0)
        .setMaxValues(roles.length)
        .addOptions(roles.map(role => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(role.label)
            .setValue(role.role)
            .setDefault(role.enabled);
        }))
        .setResponse(async (interaction: Interaction, _interactionHandler: InteractionHandler, _command) => {
          if (!interaction.isStringSelectMenu()) return;

          let changelog = '';

	  let memberRoles = new Set(member.roles.cache.keys());

          for (const role of roles) {
            if (memberRoles.has(role.role) && !interaction.values.includes(role.role)) removeRole(role);
	    if (!memberRoles.has(role.role) && interaction.values.includes(role.role)) addRole(role);
          }

          function addRole(role: RoleInfo) {
            memberRoles.add(role.role);
            changelog += `+ ${role.label}\n`;
          }

          function removeRole(role: RoleInfo) {
            memberRoles.delete(role.role);
            changelog += `- ${role.label}\n`;
          }

	  await member.roles.set([...memberRoles], `Mod Edit Roles - ${interaction.user.id}`);

          await interaction.update({
            content: `Roles updated for ${userMention(member.id)}\n\`\`\`diff\n${changelog}\`\`\``,
            components: []
          });

          const LOG_CHANNELS = SNOWFLAKE_MAP.Mod_Logs_Channels['edit_roles'] ?? SNOWFLAKE_MAP.Mod_Logs_Channels['default'];

          if (!LOG_CHANNELS) return;

          const LOG_EMBED = await EMBEDS.editRoleNotice(interaction.user, member.user, `\`\`\`diff\n${changelog}\`\`\``);

          // fetch the log channel
          for (const MOD_LOG_CHANNEL of LOG_CHANNELS) {
            const LOG_CHANNEL = await interaction.client.channels.fetch(MOD_LOG_CHANNEL);

            if (
              !LOG_CHANNEL ||
              (LOG_CHANNEL.type !== ChannelType.GuildText &&
                LOG_CHANNEL.type !== ChannelType.GuildAnnouncement &&
                LOG_CHANNEL.type !== ChannelType.PublicThread &&
                LOG_CHANNEL.type !== ChannelType.PrivateThread &&
                LOG_CHANNEL.type !== ChannelType.AnnouncementThread &&
                LOG_CHANNEL.type !== ChannelType.DM)
            )
              continue;

            try {
              await LOG_CHANNEL.send({
                embeds: [LOG_EMBED],
                allowedMentions: { parse: [] },
              });
            } catch {
              // If sending fails, it's far more important to ignore it and do the action anyway then worry and stop
            }
          }
        })
    ]);
  return DROPDOWN;
}
