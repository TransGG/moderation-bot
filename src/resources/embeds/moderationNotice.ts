import { Colors, EmbedBuilder } from 'discord.js';
import type COLLECTIONS from '@database/collections.js';
import { getRules, truncateForFields } from '@utils.js';

export default async function moderationNotice(log: InstanceType<typeof COLLECTIONS.ModerationLog>) {
  // TODO: more centralized actions definition? possibly add them to templates.actionCommand.ts
  const ACTION = (() => {
    switch (log.action) {
    case 'warn': return 'warned';
    case 'timeout': return 'timed out until ' +
        `<t:${Math.floor((log.timestamp + <number>log.duration) / 1000)}:F>`;
    case 'kick': return 'kicked';
    case 'ban': return 'banned';
    case 'verify': return 'verified';
    default: return 'warned';
    }
  })();

  const EMBED = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle('Notice')
    .setDescription(`You have been ${ACTION}.`)
    .addFields([{name: 'Reason', value: log.reason, inline: true}]);

  const RULES = await getRules();

  if (log.rule && (log.action !== 'verify')) EMBED.addFields([{
    name: `Rule ${RULES[<string>log.rule]?.ruleNumber.toString()}`,
    value: <string>RULES[<string>log.rule]?.description,
    inline: true
  }]);

  if (log.messageInfo?.content) EMBED.addFields([{
    name: 'Infracting Message Content',
    value: truncateForFields(`>>> ${log.messageInfo.content}`),
    inline: false
  }]);

  if (log.messageInfo?.attachments.size) EMBED.addFields([{
    name: 'Infracting Message Attachments',
    value: log.messageInfo.attachments.map(a => a.url).join('\n'),
    inline: false
  }]);

  if (log.action === 'ban') EMBED.addFields([{
    name: 'Appeal this ban',
    value: 'Please use [this google form](https://docs.google.com/forms/d/e/1FAIpQLSdDGRf6T5_8Dckf_c-8TIJFOLrqALQ6k5zc6EjGpMRJs-Q7pw/viewform)',
  }])

  return EMBED;
}
