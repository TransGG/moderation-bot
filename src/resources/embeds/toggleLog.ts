import { EmbedBuilder, User } from 'discord.js';
import { getRules } from '@utils.js';
import type ModerationLog from '@database/collections/userLogs/moderationLogs.js';

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

export default async function toggleLog(user: User, infraction: string, LOG: ModerationLog) {
  const RULES = await getRules();

  const rule = RULES[LOG.rule];
  const ruleText = rule !== undefined ? `Rule ${rule?.ruleNumber} (${LOG.rule})` : `Deleted rule (${LOG.rule})`;

  let messageDeletedText: string;
  if (LOG.messageInfo === undefined || LOG.messageInfo === null) {
    messageDeletedText = 'No Message';
  } else if (LOG.keepMessage === undefined || LOG.messageInfo === null) {
    messageDeletedText = 'Unknown if message was deleted';
  } else {
    messageDeletedText = LOG.keepMessage ? 'Message not deleted' : 'Message Deleted';
  }

  const EMBED = new EmbedBuilder()
    .setAuthor({ name: 'Logs for', iconURL: user.displayAvatarURL(), url: `https://discord.com/users/${user.id}` })
    .setDescription(`> <@${user.id}> (\`${user.username}\`)\n(currently ${LOG.isHidden ? 'hidden' : 'shown'})`)
    .setFooter({ text: `Infraction ID: ${infraction}` })
    .addFields([
      {
        name: `${infraction}. ${ruleText}`,
        value: LOG.reason,
        inline: true
      },
      {
        name: 'Private Notes',
        value: LOG.privateNotes ?? 'None given',
        inline: true
      },
      {
        name: `${pastTenseActions[LOG.action] ?? 'ERROR'} <t:${Math.floor(LOG.timestamp / 1000)}:R>`,
        value: messageDeletedText,
        inline: true
      }
    ]);
  return EMBED;
}
