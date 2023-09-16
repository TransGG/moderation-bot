import { AttachmentBuilder, User, type Guild, type Message, type TextChannel } from 'discord.js';

export default function createLogFile(server: Guild, channel: TextChannel, messages: Message[], users: User[], deletedUser?: User) {

  const data = {
    channel: {
      name: channel.name + (deletedUser ? ` (Note: only removed ${deletedUser.username}'s (${deletedUser.id}) messages)` : ''),
      id: channel.id
    },
    server: {
      name: server.name,
      id: server.id,
      icon: server.icon
    },
    messages: (messages.map(m => {
      return {
        discordData: {},
        nick: m.author.username,
        user_id: m.author.id,
        bot: m.author.bot,
        username: m.author.username,
        tag: m.author.tag,
        avatar: m.author.avatar,
        created: m.createdTimestamp,
        edited: m.editedAt ? true : false,
        ...m,
      }
    })).reverse()
  }

  function jtb64(data: { [key: string]: object }) {
    let letData = '';

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        letData += `let ${key} = "${Buffer.from(JSON.stringify(data[key])).toString('base64')}";`;
      }
    }

    return letData;
  }

  const extraInfo = `<Server-Info>\n  Server: ${server.name} (${server.id})\n  Channel: ${channel.name} (${channel.id})\n  Purged: ${messages.length} Messages\n\n<Affected-Users>\n  ${users.map(u => `- ${u.tag} (${u.id})`).join('\n  ')}\n\n`
  const start = '<Base-Transcript>\n  <script src="https://tickettool.xyz/transcript/transcript.bundle.min.obv.js"></script><script type="text/javascript">'
  const end = 'window.Convert(messages, channel, server)</script>'
  const attachment = new AttachmentBuilder(Buffer.from(`${extraInfo}${start}${jtb64(data)}${end}`, 'utf8'), { name: 'purge-log.html' });

  return attachment;
}


