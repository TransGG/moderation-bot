import type customisations from './customisationsType';

const config: customisations = {
  Moderation_Logs_Per_Page: 8,
  Daily_Action_Limits: {
    verify: 30,
    add_note: 30,
    warn: 30,
    timeout: 30,
    kick: 30,
    ban: 30,
    add_mature: 30,
    remove_mature: 30,
    default: 30
  },
  Staff_Cant_Punish_Staff_Restriction: {
    verify: false,
    add_mature: false,
  }
};

export default config;
