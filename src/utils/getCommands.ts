import { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import hGetModulesInFolder from './getModulesInFolder.js';

export default async function hGetCommands(directory: string) {
  // return only SlashCommandBuilders
  return (await hGetModulesInFolder(directory)).map(array => array[1])
    .filter(module => module instanceof SlashCommandBuilder || module instanceof ContextMenuCommandBuilder);
}