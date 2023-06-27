import { MessageEmbed, User } from 'discord.js';


export default async function calmdownNotice(staff_member: User, reason: string | undefined, message: string | undefined) {
  const EMBED = new MessageEmbed()
    .setAuthor({ name: 'Chat Calmed down by', iconURL: staff_member.displayAvatarURL() })
    .setDescription(`> ${staff_member}`)
    .setTimestamp();

  if (reason) {
    EMBED.addFields([
      {name: 'Reason', value: reason, inline: true},
    ])

  }

  if (message) {
    EMBED.addFields([
      {name: 'Message sent by Badeline', value: message, inline: true},
    ])
  }

  return EMBED;
}