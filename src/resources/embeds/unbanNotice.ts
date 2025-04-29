import { Colors, EmbedBuilder, type User } from 'discord.js';

export default async function unbanNotice(target: User, staff_member: User, reason: string) {
  return new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`Unbanned ${target.username}`)
    .addFields([
      { name: 'User', value: `> ${target} (\`${target.username}\`)`, inline: true },
      { name: 'Moderator', value: `> ${staff_member} (\`${staff_member.username}\`)`, inline: true },
      { name: 'Reason', value: `> ${reason}` }
    ]);
}