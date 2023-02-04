import { MessageEmbed } from 'discord.js';
import type COLLECTIONS from '@database/collections.js';
import { getRules } from '@utils.js';

export default async function moderationNotice(log: InstanceType<typeof COLLECTIONS.ModerationLog>) {
  // TODO: more centralized actions definition? possibly add them to templates.actionCommand.ts
  const ACTION = (() => {
    switch (log.action) {
    case 'warn': return 'warned';
    case 'timeout': return 'timed out until ' +
        `<t:${Math.floor((log.timestamp + <number>log.timeoutDuration) / 1000)}:F>`;
    case 'kick': return 'kicked';
    case 'ban': return 'banned';
    case 'verify': return 'verified';
    case 'add_mature': return 'given the mature role';
    case 'remove_mature': return 'removed from the mature role';
    default: return 'warned';
    }
  })();

  const EMBED = new MessageEmbed()
    .setColor('YELLOW')
    .setTitle('Notice')
    .setDescription(`You have been ${ACTION}.`)
    .addField('Reason', log.reason, true);

  const RULES = await getRules();

  if (log.rule && (log.action !== 'verify' && log.action !== 'add_mature')) EMBED.addField(
    `Rule ${log.rule?.map(rule => RULES[rule]?.ruleNumber ?? rule).join('.') ?? ''}`,
    <string>RULES[<string>log.rule[0]]?.description, // FIXME: breaks with multiple rules
    true
  );

  if (log.messageInfo?.content) EMBED.addField(
    'Infracting Message Content',
    log.messageInfo.content,
    false
  );

  if (log.messageInfo?.attachments.size) EMBED.addField(
    'Infracting Message Attachments',
    log.messageInfo.attachments.map(a => a.url).join('\n'),
    false
  );

  return EMBED;
}
