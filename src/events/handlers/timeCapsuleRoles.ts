import { getSnowflakeMap } from '@utils.js';
import { type Client, Events } from 'discord.js';

export function timeCapsuleRoles(client: Client<true>) {
  client.on(Events.MessageCreate, async (message) => {
    const snowflakes = await getSnowflakeMap();
    const roleID = snowflakes.Time_Capsule_Roles[message.channelId];
    if (roleID === undefined) return;

    await message.member?.roles.add(roleID).catch(() => null);
  })
}