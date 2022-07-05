import fs from 'node:fs';

export default async function hGetModulesInFolder(directory: string) {
  // await for all promises in the Array<Promise<any>> to be resolved
  return (await Promise.all(
    // get all files in the directory
    fs.readdirSync(directory)
      // filter out non-js files
      .filter(file => file.endsWith('.js'))
      // add ?v=<timestamp> to the end of the file path for hot reloading
      // map() will return Array<Promise<any>>
      .map(async file => [file, (await import(`${directory}/${file}?v=${Date.now()}`)).default])
      // As this .map imports from files, we could be importing anything. Therefore, we need to use any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as [string, any][];
}
