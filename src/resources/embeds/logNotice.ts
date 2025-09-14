import { Client, Colors, DiscordAPIError, EmbedBuilder, User, time } from 'discord.js';
import type COLLECTIONS from '@database/collections.js';
import { getRuleDescriptions, type ExtraActionOptions } from '@resources/commandTemplates/ActionCommand.js';

const durations = {
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
  millisecond: 1
}
function formatDuration(ms: number) {
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

export default async function logNotice(client: Client, user: User, log: InstanceType<typeof COLLECTIONS.ModerationLog>, extraActionOptions: ExtraActionOptions) {
  let moderator: User | null = null;
  try {
    moderator = await client.users.fetch(log.moderator);
  } catch (e) {
    if (!(e instanceof DiscordAPIError)) throw e;
  }

  const reason =
    log.reason.length <= 1020 ? log.reason : log.reason.slice(0, 1015) + '...';

  const message_content =
    (log.messageInfo?.content?.length as number) <= 1020 ? log.messageInfo?.content :
      log.messageInfo?.content.slice(0, 1015) + '...';

  const title = `${extraActionOptions.emoji} ${extraActionOptions.pastTense} ${log.userState.username.replace('_', '\\_')}${log.userState.discriminator === '0' ? ''
    : '#' + log.userState.discriminator}`;

  const desc = `> <@${user.id}> (\`${user.username}\`)`;
  const duration = log.duration ? formatDuration(log.duration) : '';

  const EMBED = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle(title)
    .setColor(extraActionOptions.color)
    .addFields([
      { name: 'User', value: desc, inline: true },
      { name: 'Moderator', value: `> ${moderator} (\`${moderator?.username}\`)` ?? '> Error: Could not fetch moderator', inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'Rule', value: `>>> ${await getRuleDescriptions(log.rule)}`, inline: true },
    ]);

  if (duration) {

    if (log.action === 'timeout' && log.duration) {
      EMBED.addFields([{
        name: 'Timeout Duration',
        value: `> ${duration} (Ends ${time(Math.trunc((Date.now() + log.duration) / 1000), 'R')})`,
        inline: true,
      }]);
    }

    if (log.action === 'ban' || log.action === 'kick') {
      EMBED.addFields([{
        name: 'Deleted Messages For',
        value: `> ${duration}`,
        inline: true,
      }]);
    }
  }

  EMBED.addFields([
    { name: '\u200B', value: '\u200B' },
    { name: 'Reason', value: `>>> ${reason}` },
  ]);

  if (log.privateNotes) {
    EMBED.addFields([{
      name: 'Private Notes',
      value: `> ${log.privateNotes}`,
    }]);
  }

  if (log.messageInfo) {
    const channelName = client.channels.resolveId(log.messageInfo.channelId)
    EMBED.addFields([
      { name: '\u200B', value: '\u200B' },
      { name: 'Channel', value: `<#${log.messageInfo.channelId}> (\`${channelName}\`)`, inline: true },
      { name: `Message was ${log.keepMessage ? 'not ' : ''}deleted.`, value: '\u200B', inline: true },
    ]);

    if (log.messageInfo.content) {
      EMBED.addFields([{
        name: 'Infracting Message Content',
        value: `>>> ${message_content}`,
      }]);
    }

    if (log.messageInfo.attachments.size) {
      const attachments_list: [string] = [''];
      let count = 1;
      attachments_list.pop();
      log.messageInfo.attachments.each(i => {
        attachments_list?.push(`[${count}](${i.url})`);
        count += 1;
      });

      EMBED.addFields([{
        name: 'Infracting Message Attachments',
        value: `> ${attachments_list?.join() ?? 'none'}`,
      }]);
    }
  }

  return EMBED;
}
