export default async function hGetAdvancedConf(require: NodeRequire, path: string) {
  // import config.json
  delete require.cache[require.resolve(path)];
  return require(path) as {
    Hot_Reload_Commands: boolean;
    Log_Path_Mapping_Errors: boolean;
  };
}