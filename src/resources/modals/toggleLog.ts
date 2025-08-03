import { ActionRowBuilder, Client, ComponentType, Embed, TextInputBuilder, TextInputStyle } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { ResponsiveModal } from '@interactionHandling/componentBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import EMBEDS from '@resources/embeds.js';
import { getSnowflakeMap } from '@utils.js';

function get_infraction(embed?: Embed) {
  if (!embed?.footer?.text) return -1;

  const regex = /Infraction ID: ([0-9]+)/gm;
  const match = regex.exec(embed.footer.text);
  if (!match) return -1;
  return Number(match[1]);
}

async function get_log_user(client: Client, embed?: Embed) {
  if (!embed?.description) return;

  const regex = /> <@([0-9]+)>/gm;
  const match = regex.exec(embed.description);
  if (!match || !match[1]) return;

  return await client.users.fetch(match[1]);
}

export default new ResponsiveModal()
  .setCustomId('modals.toggleLog')
  .setTitle('Toggle Log')
  .addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setLabel('Reason')
        .setCustomId('modals.toggleLog.reason')
        .setPlaceholder('An explanation of why the log entry is being toggled.')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setRequired(true),
    ),
  ).setResponse(async (interaction, _interactionHandler: InteractionHandler, _command) => {
    if (!interaction.isModalSubmit()) return;
    await interaction.deferUpdate();

    const REASON = interaction.fields.getTextInputValue('modals.toggleLog.reason');

    const this_embed = interaction.message?.embeds[0];
    const infraction = get_infraction(this_embed);

    if (infraction === -1) {
      await interaction.followUp('Could not find the infraction ID; tell the devs');
      return;
    }

    const user = await get_log_user(interaction.client, this_embed);

    if (!user) {
      await interaction.followUp('Could not find the user; tell the devs');
      return;
    }

    const button = interaction.message?.components[0]?.components[0];
    const hide = button?.type === ComponentType.Button ? button.label === 'Hide' ? true : button.label === 'Show' ? false : null : null;

    if (hide === null) {
      await interaction.followUp('Could not determine whether to hide/show the entry; tell the devs');
      return;
    }

    COLLECTIONS.UserLog.setHidden(user.id, infraction - 1, hide);

    const SNOWFLAKE_MAP = await getSnowflakeMap();
    const sr_notify_channel = await interaction.client.channels.fetch(SNOWFLAKE_MAP.Sr_Notify_Channel);

    if (!sr_notify_channel?.isTextBased()) {
      await interaction.followUp('Could not send to sr. staff.\n' +
        'Tell the devs:\n> Badeline says the channel is not a text channel (`line 88`)');
      return;
    }

    try {
      sr_notify_channel.send({
        content: `${SNOWFLAKE_MAP.Admin_Roles.map(u => `<@&${u}>`).join(', ')}`,
        embeds: [
          await EMBEDS.toggleLogNotice(
            user,
            infraction.toString(),
            interaction.user,
            REASON,
            hide,
          )],
        allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Admin_Roles },
      });

    } catch (e) {
      console.error(e);
      interaction.followUp('Could not notify sr. staff. Tell the devs to look around `line 60`');
      return;
    }

    await interaction.editReply({
      content: `This infraction has been ${hide ? 'hidden' : 'made visible'}.`,
      components: [],
      embeds: [],
    });

    return;
  });
