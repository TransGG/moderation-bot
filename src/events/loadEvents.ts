import type { Client } from 'discord.js';
import { timeCapsuleRoles } from './handlers/timeCapsuleRoles.js';

export function loadEvents(client: Client<true>) {
  timeCapsuleRoles(client);
}