import chokidar from 'chokidar';
import hGetCommands from './getCommands.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';

export default function hWatchAndReloadCommands(interactionHandler: InteractionHandler, directory: string) {
  chokidar.watch(directory).on('change', async path => {
    if (!path.endsWith('.js')) return;
    await interactionHandler.setCommands(await hGetCommands(directory));
  });
}