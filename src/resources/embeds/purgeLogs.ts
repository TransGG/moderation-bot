import { Client, Colors, DiscordAPIError, EmbedBuilder, User } from 'discord.js';

export default async function logNotice(client: Client, moderator: User, users: User[], reason: string, amount: number, privateNotes?: string, attachmentURL?: string) {
  try {
    moderator = await client.users.fetch(moderator);
  } catch (e) {
    if (!(e instanceof DiscordAPIError)) throw e;
  }

  reason = reason.length <= 1020 ? reason : reason.slice(0, 1015) + '...';

  const EMBED = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle(`🗑️ Purged ${amount} messages`)
    .setColor(0x70CCC9)
    .addFields([
      { name: 'Moderator', value: `> ${moderator} (\`${moderator.username}\`)` ?? '> Error: Could not fetch moderator', inline: true },
    ]);


  if (attachmentURL) {
    EMBED.addFields([{
      name: 'Purge Transcript',
      value: `[Purge Transcript](https://tickettool.xyz/direct?url=${attachmentURL})`,
      inline: true,
    }]);
  }

  EMBED.addFields([
    { name: 'Affected Users', value: `>>> ${users.map(u => `<@${u.id}> (\`${u.username}\`)`).join('\n')}`, inline: false },
    { name: 'Reason', value: `>>> ${reason}`, inline: false }
  ]);

  if (privateNotes) {
    EMBED.addFields([{
      name: 'Private Notes',
      value: `>>> ${privateNotes}`,
      inline: false,
    }]);
  }


  return EMBED;
}
