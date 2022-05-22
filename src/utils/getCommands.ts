import fs from 'node:fs'
import { SlashCommandBuilder } from '@discordjs/builders';

export default async function hGetCommands(directory: string) {
  // await for all promises in the Array<Promise<ResponsiveSlashCommandBuilder>> to be resolved
  return (await Promise.all(
    // get all files in the commands directory
    fs.readdirSync(directory)
      // filter out non-js files
      .filter(file => file.endsWith('.js'))
      // add ?v=<timestamp> to the end of the file path for hot reloading
      // map() will return Array<Promise<ResponsiveSlashCommandBuilder>>
      .map(async file => (await import(`${directory}/${file}?v=${Date.now()}`)).default)
    // return only SlashCommandBuilders
  )).filter(module => module instanceof SlashCommandBuilder);
}