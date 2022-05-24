const CONFIG_PATH = '../resources/config.json';
export default async function hGetConfig(require: NodeRequire) {
  // import config.json
  delete require.cache[require.resolve(CONFIG_PATH)];
  return require(CONFIG_PATH) as {
    Discord_Bot_Token: string;
    Global_Commands: boolean;
    Discord_Guild_IDs: string[];
    MongoDB_URI: string;
    Hot_Reload_Commands: boolean;

    Staff_Role_IDs: string[];
  };
}