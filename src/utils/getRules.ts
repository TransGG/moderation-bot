const RULES_PATH = '../resources/rules.json';

// helper function to shorten JSON.stringify()
function s(value: any) { return JSON.stringify(value, null, 2); }
export default async function hGetRules(require: NodeRequire) {
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