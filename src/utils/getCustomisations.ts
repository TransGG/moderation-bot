export default async function hGetCustomisations(require: NodeRequire, path: string) {
  // import customisations.json
  delete require.cache[require.resolve(path)];
  return require(path) as {
    Moderation_Logs_Per_Page: number
  };
}
