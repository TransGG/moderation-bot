import type customisations from './customisationsType';

const config: customisations = {
  Moderation_Logs_Per_Page: 6,
  Daily_Action_Limits: {
    verify: 30,
    add_note: 30,
    warn: 30,
    timeout: 30,
    kick: 30,
    ban: 30,
    purge: 3,
    default: 30
  },
  Staff_Cant_Punish_Staff_Restriction: {
    verify: false,
    add_note: false,
  }
};

export default config;
