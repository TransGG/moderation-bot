import { MessageEmbed, Snowflake, User, VoiceState } from 'discord.js';
import COLLECTIONS from '@database/collections.js';

function pushReportsCount(array: string[], length: number, prevTimeLength: number, time: string) {
  if (length && length > prevTimeLength)
    array.push(`**${length}** ${length === 1 ? 'time' : 'times'} in __${time}__`);
}

async function reportsCountSummary(userID: Snowflake) {
  const LOGS = (await COLLECTIONS.UserLog.getUserLog(userID)).reportLogs;
  const DAY = LOGS.filter(log => log.timestamp > Date.now() - 86400000).length;
  const WEEK = LOGS.filter(log => log.timestamp > Date.now() - 604800000).length;
  const MONTH = LOGS.filter(log => log.timestamp > Date.now() - 2628000000).length;
  const YEAR = LOGS.filter(log => log.timestamp > Date.now() - 31536000000).length;
  const ALL = LOGS.length;

  const LINES: string[] = [];
  pushReportsCount(LINES, DAY, 0, 'the past 24 hours');
  pushReportsCount(LINES, WEEK, DAY, 'the past 7 days');
  pushReportsCount(LINES, MONTH, WEEK, 'the past 30 days');
  pushReportsCount(LINES, YEAR, MONTH, 'the past 365 days');
  pushReportsCount(LINES, ALL, YEAR, 'total');
  return LINES.join('\n');
}

export default async function messageReport(reporter: User, reason: string, user: User, voice: VoiceState) {
  const EMBED = new MessageEmbed()
    .setAuthor({ name: 'Reported By', iconURL: reporter.displayAvatarURL() })
    .setDescription(`> ${reporter}`)
    .addFields([
      {name: 'Reason', value: reason, inline: true},
      {name: 'This user has been reported', value: await reportsCountSummary(user.id), inline: true},
      {name: '\u200b', value: '\u200b'},
      {name: 'Reported User', value: user.toString(), inline: true},
      {name: '\u200b', value: '\u200b'},
    ])
    .setTimestamp();

  if (voice.channel) {
    EMBED.addFields([
      {name: 'Current Voice Channel', value: voice.channel?.toString(), inline: true}
    ])
  }

  return EMBED;
}