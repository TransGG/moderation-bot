export default interface snowflakeMap {
  /**
   * Only used when registering commands. If global commands are enabled then
   * this is not needed
   */
  Discord_Guilds?: string[];

  /**
   * Stops staff from punishing other staff
   */
  Staff_Roles: string[];

  /**
   * Roles that will be pinged when a message is reported
   */
  Report_Notification_Roles: string[];

  /**
   * Roles that cannot report messages (i.e. a role for people who continually
   * abuse the report facility)
   */
  Report_Banned_Roles: string[];

  /**
   * Channels that reports will be sent to
   */
  Reports_Channels: string[];

  /**
   * Channels that different types of moderation logs will be sent to. Keys are
   * type of punishment (i.e. kick) OR extraCategories of rule broken (i.e.
   * rule-other) OR default to define a fallback channel
   */
  Mod_Logs_Channels: Record<string, string[]>;

  /**
   * A list of roles that members verified with /mod user verify should be given
   * Often this will be the same role that you use in your regular verification
   * system, however you may want to add multiple roles (i.e. to track who was
   * verified by mods)
   */
  Verified_Roles: string[];
}
