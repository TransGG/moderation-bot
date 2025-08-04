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

async function getModerationLogsPages(user: User, showHidden: boolean, showPage: number | null, requester: User | null) {
  const LPP = (await getCustomisations()).Moderation_Logs_Per_Page;

  const LOGS = await COLLECTIONS.UserLog.getUserAndConnectedLogs(user.id);
  const entries = LOGS.flatMap((log) => log.moderationLogs.map((entry) => ({ userID: log.userID, ...entry }))).sort((a, b) => a.timestamp - b.timestamp);

  const PAGES = Math.ceil(entries.length / LPP);
  const RULES = await getRules();

  const SLICE = showPage ? entries.slice(showPage * LPP, (showPage + 1) * LPP) : entries;

  return new Array(Math.ceil(SLICE.length / LPP)).fill(0).map((_, page) => new EmbedBuilder()
    .setAuthor(page === 0 ? { name: 'Logs for', iconURL: user.displayAvatarURL(), url: `https://discord.com/users/${user.id}` } : null)
    .setDescription(page === 0 ? `> <@${user.id}> (\`${user.username}\`)` : null)
    .setFooter({ text: `Page ${(showPage ?? page) + 1} of ${PAGES ? PAGES : 1} | Showing Hidden: ${showHidden} ${requester ? `| Requested by: ${requester.username} (${requester.id})` : ''}`})
    .addFields(SLICE.slice(page * LPP, (page + 1) * LPP).map((log, index) => {
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
          name: `${(showPage ?? page) * LPP + index + 1}. ${ruleText}`,
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
    }).flat()),
  );
}

export default async function moderationLogs(user: User, showHidden = false, page = 1) {
  const singletonArray = await getModerationLogsPages(user, showHidden, page - 1, null);
  return singletonArray[0] ?? new EmbedBuilder().setDescription('Function `getModerationLogsPages` returned `[]`, tell the devs');
}

export async function moderationAllLogs(user: User, showHidden = false, requester: User) {
  return await getModerationLogsPages(user, showHidden, null, requester);
}