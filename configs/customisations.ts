import type customisations from './customisationsType';

const config: customisations = {
  Moderation_Logs_Per_Page: 10,
  Daily_Action_Limits: {
    verify: 30,
    warn: 30,
    timeout: 30,
    kick: 30,
    ban: 30,
    add_mature: 30,
    remove_mature: 30,
    default: 30
  }
};

export default config;
