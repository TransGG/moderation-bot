export default async function hGetConfig(require: NodeRequire, path: string) {
  // import config.json
  delete require.cache[require.resolve(path)];
  return require(path) as {
    Discord_Bot_Token: string;
    MongoDB_URI: string;
    Global_Commands: boolean;
    Hot_Reload_Commands: boolean;
  };
}