import { truncateForFields } from '@utils.js';
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
    const url = new URL(attachmentURL);
    const path = url.pathname; // format: /attachments/<channel>/<message>/<filename>

    const ex = url.searchParams.get('ex');
    const is = url.searchParams.get('is');
    const hm = url.searchParams.get('hm');

    EMBED.addFields([{
      name: 'Purge Transcript',
      value: `[Purge Transcript](https://tickettool.xyz/transcript/v1/${path.split('/').slice(2).join('/')}/${ex}/${is}/${hm})`,
      inline: true,
    }]);
  }

  EMBED.addFields([
    { name: 'Affected Users', value: truncateForFields(`>>> ${users.map(u => `<@${u.id}> (\`${u.username}\`)`).join('\n')}`), inline: false },
    { name: 'Reason', value: truncateForFields(`>>> ${reason}`), inline: false }
  ]);

  if (privateNotes) {
    EMBED.addFields([{
      name: 'Private Notes',
      value: truncateForFields(`>>> ${privateNotes}`),
      inline: false,
    }]);
  }


  return EMBED;
}
