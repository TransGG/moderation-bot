export default async function hGetSnowflakeMap(require: NodeRequire, path: string) {
  // import config.json
  delete require.cache[require.resolve(path)];
  return require(path) as {
    Discord_Guilds?: string[] | null;
    Staff_Roles: string[];
    Report_Notification_Roles: string[];
    Report_Banned_Roles: string[];
    Reports_Channels: string[];
    Verified_Role: string;
  };
}
