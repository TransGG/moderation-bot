import { EmbedBuilder, User, Colors} from 'discord.js';


export default async function editRoleNotice(staff_member: User, user: User, changelog: string) {

  const EMBED = new EmbedBuilder()
    .setColor(Colors.Fuchsia)
    .setTitle(`✅ Edited roles for ${user.username}`)
    .addFields([
      { name: 'User', value: `> <@${user.id}> (\`${user.id}\`)`, inline: true },
      { name: 'Moderator', value: `> <@${staff_member.id}>` ?? '> Error: Could not fetch moderator', inline: true },
      { name: '\u200B', value: '\u200B' },

      { name: 'Role Changes', value: changelog, inline: false },
    ]);

  return EMBED;
}