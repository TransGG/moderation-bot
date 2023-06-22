export default interface customisations {
  Moderation_Logs_Per_Page: number,
  Daily_Action_Limits: {
    verify: number,
    warn: number,
    timeout: number,
    kick: number,
    ban: number,
    add_mature: number,
    remove_mature: number,
    default: number
  },
  Waive_Staff_Cant_Punish_Staff_Restriction: {
    verify: boolean,
    warn: boolean,
    timeout: boolean,
    kick: boolean,
    ban: boolean,
    add_mature: boolean,
    remove_mature: boolean
  },
}
