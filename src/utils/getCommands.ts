import {
  ResponsiveContextMenuCommandBuilder,
  ResponsiveSlashCommandBuilder,
} from '@interactionHandling/commandBuilders.js';
import hGetModulesInFolder from './getModulesInFolder.js';

export default async function hGetCommands(directory: string) {
  // return only SlashCommandBuilders
  return (await hGetModulesInFolder(directory))
    .map((array) => array[1])
    .filter(
      (module) =>
        module instanceof ResponsiveSlashCommandBuilder ||
                module instanceof ResponsiveContextMenuCommandBuilder
    );
}
