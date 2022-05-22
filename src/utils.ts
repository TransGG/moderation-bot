import Module from "node:module";
const require = Module.createRequire(import.meta.url);

export async function uncachedImport(path: string) {
  return (await import(`${path}?v=${Date.now()}`)).default;
}

const CONFIG_PATH = '../resources/config.json';
const CUSTOMISATIONS_PATH = '../resources/customisations.json';
const RULES_PATH = '../resources/rules.json';

export async function getConfig() {
  // import config.json
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

export async function getCustomisations() {
  // import customisations.json
  delete require.cache[require.resolve(CUSTOMISATIONS_PATH)];
  return require(CUSTOMISATIONS_PATH) as {
    Moderation_Logs_Per_Page: number
  };
}

// helper function to shorten JSON.stringify()
function s(value: any) { return JSON.stringify(value, null, 2); }
export async function getRules() {
  // import rules.json
  delete require.cache[require.resolve(RULES_PATH)];
  let rules = require(RULES_PATH) as {
    index: number;
    description: string;
    shortDesc: string;
    extended?: {
      index: string;
      shortDesc: string;
      description: string;
      active: boolean;
    }[];
    active: boolean;
  }[];
  if (!(rules instanceof Array)) throw new Error('rules.json must be an array');

  rules.forEach((rule, i) => {
    // validate rule
    if (
      rule.index === undefined ||
      rule.shortDesc === undefined ||
      rule.description === undefined ||
      !(rule.extended instanceof Array) ||
      typeof rule.active !== 'boolean'
    ) throw new Error(
      `rules.json[${i}] is invalid\n` +
      s(rule)
    );

    // validate rule's extended rules
    rule.extended.forEach((extended, j) => {
      if (
        extended.index === undefined ||
        extended.shortDesc === undefined ||
        extended.description === undefined ||
        typeof extended.active !== 'boolean'
      ) throw new Error(
        `rules.json[${i}].extended[${j}] is invalid\n` +
        s(rule) + '\n' +
        s(extended)
      );
    });
  })

  // validated
  return rules;
}