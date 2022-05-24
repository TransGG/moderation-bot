import { Guild, Message, MessageEmbed, User } from "discord.js";

export default function messageReport(reporter: User, reason: string, message: Message, guild: Guild) {
  const EMBED = new MessageEmbed()
    .setAuthor({ name: 'Reported By', iconURL: reporter.displayAvatarURL() })
    .setDescription(`> ${reporter}\n${reason}`)
    .addField(
      'Message Link',
      `[Here](https://discord.com/channels/${guild.id}/${message.channel.id}/${message.id})`,
      true
    )
    .addField(
      'Message Channel',
      message.channel.toString(),
      true
    )
    .addField(
      'Reported User',
      message.author.toString(),
      true
    );

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