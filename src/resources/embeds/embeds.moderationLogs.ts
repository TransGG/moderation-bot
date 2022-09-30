/* eslint-disable @typescript-eslint/no-non-null-assertion */
// FIXME: We shouldn't be disabling this assertion. At some point, let's add in
// better checking for rules, but for now we know a situ with no rules broken or
// can never happen

import { MessageEmbed, User } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { getCustomisations, getRules } from '@utils.js';

// TODO: give more info and polish layout

export default async function moderationLogs(user: User, page = 1) {
  const LPP = (await getCustomisations()).Moderation_Logs_Per_Page;

  const LOGS = (await COLLECTIONS.UserLog.getUserLog(user.id)).moderationLogs;
  const PAGES = Math.ceil(LOGS.length / LPP);
  const STARTING_INDEX = (page - 1) * LPP;
  const RULES = await getRules();

  return new MessageEmbed()
    .setAuthor({ name: 'Logs for', iconURL: user.displayAvatarURL() })
    .setDescription(`> <@${user.id}>`)
    .setFooter({ text: `Page ${page} of ${PAGES ? PAGES : 1}` })
    .addFields(LOGS.slice(STARTING_INDEX, STARTING_INDEX + LPP).map(log => {
      const rule = RULES[log.rule![0]!]; // FIXME: Breaks with multiple rules
      const ruleText = rule !== undefined ? `Rule ${rule?.ruleNumber} (${log.rule![0]!})` : `Deleted rule (${log.rule![0]!})`;

      return [
        {
          name: ruleText,
          value: log.reason,
          inline: true
        },
        {
          name: 'Private Notes',
          value: log.privateNotes ?? 'None given',
          inline: true
        },
        {
          name: `<t:${Math.floor(log.timestamp / 1000)}:R>`,
          value: log.action,
          inline: true
        }
      ]}).flat());
}
