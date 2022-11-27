export default interface customisations {
  Moderation_Logs_Per_Page: number,
  Daily_Action_Limits: {
    verify: number,
    warn: number,
    timeout: number,
    kick: number,
    ban: number,
    default: number
  }
}
