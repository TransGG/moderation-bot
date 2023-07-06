import { Client, Colors, DiscordAPIError, EmbedBuilder, User } from 'discord.js';
import type COLLECTIONS from '@database/collections.js';
import { getRuleDescriptions, type ExtraActionOptions } from '@resources/commandTemplates/templates.ActionCommand.js';

const durations = {
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
  millisecond: 1
}
function formatDuration (ms: number) {
  const parts = [];

  for (const [name, duration] of Object.entries(durations)) {
    const count = Math.trunc(ms / duration);
    if (count > 0) {
      parts.push(`${count} ${name}${count !== 1 ? 's' : ''}`);
      ms -= duration * count;
    }
  }

  return parts.join(', ');
}



export default async function logNotice(client: Client, user: User,log: InstanceType<typeof COLLECTIONS.ModerationLog>, extraActionOptions: ExtraActionOptions) {
  let moderator: User | null = null;
  try {
    moderator = await client.users.fetch(log.moderator);
  } catch (e) {
    if (!(e instanceof DiscordAPIError)) throw e;
  }

  const reason =
    log.reason.length <= 1024 ? log.reason : log.reason.slice(0, 1020) + '...';

  const title = `${extraActionOptions.emoji} ${moderator ?? 'Unknown'} *${
    extraActionOptions.pastTense
  }* ${log.userState.username}${log.userState.discriminator === '0' ? '' : '#' + log.userState.discriminator}`;

  const desc = `> [\`${
    user.id
  }\`, <@${user.id}>]`;
  const duration = log.duration ? formatDuration(log.duration) : '';

  const EMBED = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle(title)
    .setDescription(desc)
    .addFields([
      {name: 'Reason', value: reason, inline: false},
      {name: 'Rule', value: await getRuleDescriptions(log.rule), inline: false},
    ])

  if (duration) {
    EMBED.addFields([{
      name: 'Duration',
      value: duration,
      inline: false,},
    ])
  }

  if (log.privateNotes) {
    EMBED.addFields([{
      name: 'Private Notes',
      value: `> ${log.privateNotes}`,
      inline: false,
    }]);
  }

  if (log.messageInfo?.content) {
    EMBED.addFields([{
      name: 'Infracting Message Content',
      value: log.messageInfo.content,
      inline: false
    }]);
  }

  if (log.messageInfo?.attachments.size) {
    EMBED.addFields([{
      name: 'Infracting Message Attachments',
      value: log.messageInfo.attachments.map(a => a.url).join('\n'),
      inline: false
    }]);
  }

  return EMBED;
}
