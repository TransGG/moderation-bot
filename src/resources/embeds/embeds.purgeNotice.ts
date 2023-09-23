import { EmbedBuilder, User } from 'discord.js';

export default async function purgeNotice(users: User[], amount: number, reason?: string) {
  const EMBED = new EmbedBuilder()
    .setAuthor({ name: `${amount} messages purged`})
    .setDescription(`> ${reason}\n### Affected Users:\n${users.map(u => `<@${u.id}>`).join('\n')}`)
    .setTimestamp();
  return EMBED;
}