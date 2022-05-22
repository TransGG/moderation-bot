import { SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";
import type { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import { ResponsiveSlashCommandSubcommandBuilder } from "../../../commandHandling/commandBuilders.js";
import COLLECTIONS from "../../../database/collections.js";
import { getRules } from "../../../utils.js";

export default new ResponsiveSlashCommandSubcommandBuilder()
  .setName('user')
  .setDescription('Take moderation action on a user')
  .addUserOption(new SlashCommandUserOption()
    .setName('user')
    .setDescription('The user to take action on')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName('reason')
    .setDescription('The reason for the action')
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName("rule")
    .setDescription("The rule to apply")
    .addChoices(...await (async () => {
      const RULES: APIApplicationCommandOptionChoice<string>[] = [];
      (await getRules()).forEach((rule, i) => {
        if (!rule.active) return;
        RULES.push({name: `${rule.index}. ${rule.shortDesc}`, value: i.toString()});

        // extended rules exceed 25 choices limit
        //rule.extended?.forEach((extended, j) => {
        //  if (!extended.active) return;
        //  RULES.push({name: `${rule.index}.${extended.index}. ${extended.shortDesc}`, value: `${i}.${j}`});
        //});
      });
    
      return RULES;
    })())
    .setRequired(false)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName("private-notes")
    .setDescription("Private notes to add")
    .setRequired(false)
  )
  .addStringOption(new SlashCommandStringOption()
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