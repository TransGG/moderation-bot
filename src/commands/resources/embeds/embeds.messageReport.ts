import { Guild, Message, MessageEmbed, Snowflake, User } from "discord.js";
import COLLECTIONS from "../../../database/collections.js";

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
  pushReportsCount(LINES, WEEK, DAY, 'the past week');
  pushReportsCount(LINES, MONTH, WEEK, 'the past month');
  pushReportsCount(LINES, YEAR, MONTH, 'the past year');
  pushReportsCount(LINES, ALL, YEAR, 'total');
  return LINES.join('\n');
}

export default async function messageReport(reporter: User, reason: string, message: Message, guild: Guild) {
  const EMBED = new MessageEmbed()
    .setAuthor({ name: 'Reported By', iconURL: reporter.displayAvatarURL() })
    .setDescription(`> ${reporter}`)
    .addField('Reason', reason, true)
    .addField('This user has been reported', await reportsCountSummary(message.author.id), true)
    .addField('\u200b', '\u200b')
    .addField(
      'Message Link',
      `[Jump to message](https://discord.com/channels/${guild.id}/${message.channel.id}/${message.id})`,
      true
    )
    .addField('Message Channel', message.channel.toString(), true)
    .addField('Reported User', message.author.toString(), true)
    .addField('\u200b', '\u200b')
    .setTimestamp()

  if (message.content) EMBED.addField(
    'Reported Message Content',
    message.content,
    false
  );

  if (message.attachments.size) EMBED.addField(
    'Reported Message Attachments',
    message.attachments.map(a => a.url).join('\n'),
    false
  );

  return EMBED;
}