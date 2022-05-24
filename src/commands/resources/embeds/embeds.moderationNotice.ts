import { MessageEmbed } from 'discord.js';
import type { ModerationLog } from '../../../database/collections/collections.userLogs.js';
import { getRules } from '../../../utils.js';

export default async function moderationNotice(log: ModerationLog) {
  // TODO: handle this better?
  const ACTION = (() => {
    switch (log.action) {
      case 'warn': return 'warned';
      case 'timeout': return 'timed out until ' +
        `<t:${Math.floor((log.timestamp + <number>log.timeoutDuration) / 1000)}:F>`;
      case 'kick': return 'kicked';
      case 'ban': return 'banned';
      default: return 'warned'
    }
  })()

  const EMBED = new MessageEmbed()
    .setColor('YELLOW')
    .setTitle('Notice')
    .setDescription(`You have been ${ACTION}.`)
    .addField('Reason', log.reason, true);

  if (log.rule) EMBED.addField(
    `Rule ${log.rule?.join('.') ?? ''}`,
    <string>(await getRules())[<number>log.rule[0]]?.description,
    true
  );

  if (log.message?.content) EMBED.addField(
    'Infracting Message Content',
    log.message.content,
    false
  )

  if (log.message?.attachments) EMBED.addField(
    'Infracting Message Attachments',
    log.message.attachments.map(a => a.url).join('\n'),
    false
  );

  return EMBED;
}