export default interface customisations {
  Moderation_Logs_Per_Page: number,
  Daily_Action_Limits: {
    verify: number,
    add_note: number,
    warn: number,
    timeout: number,
    kick: number,
    ban: number,
    purge: number,
    default: number
  },
  Staff_Cant_Punish_Staff_Restriction: {
    verify?: boolean,
    add_note?: boolean,
    warn?: boolean,
    timeout?: boolean,
    kick?: boolean,
    ban?: boolean,
  },
}
