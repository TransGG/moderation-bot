const CUSTOMISATIONS_PATH = '../resources/customisations.json';

export default async function hGetCustomisations(require: NodeRequire) {
  // import customisations.json
  delete require.cache[require.resolve(CUSTOMISATIONS_PATH)];
  return require(CUSTOMISATIONS_PATH) as {
    Moderation_Logs_Per_Page: number
  };
}
