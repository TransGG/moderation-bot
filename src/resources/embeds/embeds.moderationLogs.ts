import { MessageEmbed, User } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { getCustomisations } from '@utils.js';

// TODO: give more info and polish layout

export default async function moderationLogs(user: User, page = 1) {
  const LPP = (await getCustomisations()).Moderation_Logs_Per_Page;

  const LOGS = (await COLLECTIONS.UserLog.getUserLog(user.id)).moderationLogs;
  const PAGES = Math.ceil(LOGS.length / LPP);
  const STARTING_INDEX = (page - 1) * LPP;

  return new MessageEmbed()
    .setAuthor({ name: 'Logs for', iconURL: user.displayAvatarURL() })
    .setDescription(`> <@${user.id}>`)
    .setFooter({ text: `Page ${page} of ${PAGES ? PAGES : 1}` })
    .addFields(LOGS.slice(STARTING_INDEX, STARTING_INDEX + LPP).map(log => [
      {
        name: `Rule ${log.rule ? `${log.rule.map(r => ++r).join('.')}` : ''}`,
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
    ]).flat());
}
