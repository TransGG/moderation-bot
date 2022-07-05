// helper function to shorten JSON.stringify()
// JSON.stringify takes any as a first parameter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function s(value: any) { return JSON.stringify(value, null, 2); }

export default async function hGetRules(require: NodeRequire, path: string) {
  // import rules.json
  delete require.cache[require.resolve(path)];
  const rules = require(path) as {
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

  // validate json
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
  });

  // validated
  return rules;
}
