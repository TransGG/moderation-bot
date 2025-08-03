import { EmbedBuilder, User } from 'discord.js';
import COLLECTIONS from '@database/collections.js';
import { getRules } from '@utils.js';

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

export default async function toggleLogNotice(user: User, infraction: string, moderator: User, reason: string, hidden: boolean) {
  const LOGS = (await COLLECTIONS.UserLog.getUserLog(user.id)).moderationLogs;

  const LOG = LOGS[parseInt(infraction) - 1];

  const RULES = await getRules();

  if (LOG === undefined) {
    return new EmbedBuilder().setDescription('Infraction not found');
  }

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
    .setAuthor({ name: `Log toggled (now ${hidden ? 'hidden' : 'shown'}) by`, iconURL: moderator.displayAvatarURL(), url: `https://discord.com/users/${moderator.id}` })
    .setDescription(`> <@${moderator.id}> (\`${moderator.username}\`)`)
    .setFooter({ text: `Moderated User: @${user.username} (${user.id})` })
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
      },
      {
        name: 'Reason',
        value: reason
      }
    ]);
  return EMBED;
}
