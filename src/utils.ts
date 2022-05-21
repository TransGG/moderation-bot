import Module from "node:module";
const require = Module.createRequire(import.meta.url);

export async function uncachedImport(path: string) {
  return (await import(`${path}?v=${Date.now()}`)).default;
}

const CONFIG_PATH = '../resources/config.json';
export async function getConfig() {
  delete require.cache[require.resolve(CONFIG_PATH)];
  return require(CONFIG_PATH) as {
      Discord_Bot_Token: string;
      Global_Commands: boolean;
      Discord_Guild_IDs: string[];
      MongoDB_URI: string;
      Hot_Reload_Commands: boolean;

      Moderator_Role_IDs: string[];
    };
}