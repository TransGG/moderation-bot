import COLLECTIONS from '@database/collections.js';
import { getCustomisations, getRules } from '@utils.js';
import { EmbedBuilder, User } from 'discord.js';

// TODO: give more info and polish layout

const pastTenseActions: Record<string, string> = {
  warn: 'Warned',
  timeout: 'Timed out',
  kick: 'Kicked',
  ban: 'Banned',
  add_note: 'Note added',
  verify: 'Specially verified', //legacy
  add_mature: 'Received the mature role', // legacy
}

export default async function moderationLogs(user: User, showHidden = false, page = 1) {
  const LPP = (await getCustomisations()).Moderation_Logs_Per_Page;

  const LOGS = await COLLECTIONS.UserLog.getUserAndConnectedLogs(user.id);
  const entries = LOGS.flatMap((log) => log.moderationLogs.map((entry) => ({ userID: log.userID, ...entry }))).sort((a, b) => a.timestamp - b.timestamp);

  const PAGES = Math.ceil(entries.length / LPP);
  const STARTING_INDEX = (page - 1) * LPP;
  const RULES = await getRules();

  const EMBED = new EmbedBuilder()
    .setAuthor({ name: 'Logs for', iconURL: user.displayAvatarURL(), url: `https://discord.com/users/${user.id}` })
    .setDescription(`> <@${user.id}> (\`${user.username}\`)`)
    .setFooter({ text: `Page ${page} of ${PAGES ? PAGES : 1} | Showing Hidden: ${showHidden}` })
    .addFields(entries.slice(STARTING_INDEX, STARTING_INDEX + LPP).map((log, index) => {
      const rule = RULES[log.rule];
      const ruleText = rule !== undefined ? `Rule ${rule?.ruleNumber} (${log.rule})` : `Deleted rule (${log.rule})`;
      let messageDeletedText: string;
      if (log.messageInfo === undefined || log.messageInfo === null) {
        messageDeletedText = 'No Message';
      } else if (log.keepMessage === undefined || log.messageInfo === null) {
        messageDeletedText = 'Unknown if message was deleted';
      } else {
        messageDeletedText = log.keepMessage ? 'Message not deleted' : 'Message Deleted';
      }

      if (log.isHidden == true && showHidden == false) return [];

      return [
        {
          name: `${STARTING_INDEX + index + 1}. ${ruleText}`,
          value: log.reason,
          inline: true
        },
        {
          name: 'Private Notes',
          value: log.privateNotes ?? 'None given',
          inline: true
        },
        {
          name: `${pastTenseActions[log.action] ?? 'ERROR'} <t:${Math.floor(log.timestamp / 1000)}:R>`,
          value: `${messageDeletedText} ${log.userID === user.id ? '' : `(this entry was added to the linked account <@${log.userID}> — \`${log.userID}\`)`}`,
          inline: true
        }
      ]
    }).flat());
  return EMBED;
}
