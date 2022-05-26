import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import { getRules } from '../../../utils.js';

export default async function actionCommand(builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
  return builder
    .addStringOption(new SlashCommandStringOption()
      .setName('action')
      .setDescription('The action to take')
      .addChoices(
        // TODO: more centralised actions definition?
        { name: 'Warn', value: 'warn' },
        { name: 'Timeout', value: 'timeout' },
        { name: 'Kick', value: 'kick' },
        { name: 'Ban', value: 'ban' }
      )
      .setRequired(true)
    )
    .addStringOption(new SlashCommandStringOption()
      .setName('reason')
      .setDescription('The reason for the action')
      .setRequired(true)
    )
    .addStringOption(new SlashCommandStringOption()
      .setName('timeout-duration')
      .setDescription('Duration of the timeout, if the action is a timeout')
      .setRequired(false)
    )
    .addStringOption(new SlashCommandStringOption()
      .setName('rule')
      .setDescription('The rule to apply')
      .addChoices(...await (async () => {
        const RULES: APIApplicationCommandOptionChoice<string>[] = [];
        (await getRules()).forEach((rule, i) => {
          if (!rule.active) return;
          RULES.push({ name: `${rule.index}. ${rule.shortDesc}`, value: i.toString() });

          // FIXME: extended rules exceed 25 choices limit
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
      .setName('private-notes')
      .setDescription('Private notes to add')
      .setRequired(false)
    )
}