import type rules from './rulesType';

const config: rules = {
  hate: {
    ruleNumber: 1,
    shortDesc: 'Hate',
    description: '**Hate has no home here.** No hate speech, slurs, homophobia, gatekeeping (including transmedicalism), or transphobia is allowed under **ANY** circumstances. (Even in "joking" scenarios.). **Please refrain from sharing any Images/Videos containing the above content, even if the intention is to criticise the individuals responsible.**',
    extended: [],
    active: true,
  },
  nsfw: {
    ruleNumber: 2,
    shortDesc: 'NSFW/Age-restricted content',
    description:
      '**No age-restricted, obscene, shocking, gory, or overly violent content.** Our community remains appropriate for anyone over the age of 13; any content deemed unfit for this is disallowed. If something straddles the line, ask a mod, CW, or don’t post it at all. This includes text, images, or links.',
    extended: [],
    active: true,
  },
  disallowedopics: {
    ruleNumber: 3,
    shortDesc: 'Disallowed topic or phrase',
    description:
      '**Avoid disallowed topics and phrases.** This includes, but is not limited to: **heavy venting,** **political discussions,** **piracy,** and **promoting or extensively discussing the use of recreational substances, legal or otherwise.** `(#mature-general is an exception for legal substances)`.',
    extended: [],
    active: true,
  },
  diy: {
    ruleNumber: 4,
    shortDesc: 'Advocating DIY Medical treatment or HRT',
    description:
      '**Advocating any Illegitimate/DIY Medical treatment is not permitted, especially HRT, binders, and dosages.** This extends to conversations about sourcing HRT through illegitimate means. Additionally, please refrain from discussing/encouraging DIY binders, as they have the potential to harm the wearers if not properly handled.',
    extended: [],
    active: true,
  },
  harassment: {
    ruleNumber: 5,
    shortDesc: 'Harassment/Discrimination',
    description:
      '**Treat everyone with respect.** Refrain from engaging in any form of discrimination against others, regardless of age, gender, identity, orientation, and so forth. Absolutely no harassment, witch hunting, sexism, racism, or any form of hate targeting generalised groups of people will be tolerated.',
    extended: [],
    active: true,
  },
  plurality: {
    ruleNumber: 6,
    shortDesc: 'Disrespecting Plurality/Disallowed PK usage',
    description:
      '**Respect plural members, and only use PK for our allowed use cases.** If you see users talking with the bot tag, they\'re talking through PluralKit. Due to Discord limitations, these messages will show up with the `[BOT]` tag - however, they are not bots, they are users. **Additionally, PluralKit is only to be used as a mental health aid, not for any form of roleplay.**',
    extended: [],
    active: true,
  },
  triggers: {
    ruleNumber: 7,
    shortDesc: 'Disrespecting triggers / Disregarding responsibility',
    description:
      '**Be considerate of others\' triggers.** We understand that with such a diverse and large community, it\'s not always feasible to avoid every trigger. Nevertheless, please make an effort to acknowledge and respect others\' triggers, refrain from attempting to change their mind or prove them wrong. **Remember, as this large community, your triggers are also your responsibility too.** If a chat topic triggers you (unless listed below), consider stepping back and removing yourself from the situation until the conversation topic changes.\n\n> ***Note:*** *You can hide messages with triggering content by using a double upright slash:* TW ||trigger|| - ||content||. For instance, "TW ||spiders|| - ||Check out these [Spider Images]||."',
    extended: [],
    active: true,
  },
  modding: {
    ruleNumber: 8,
    shortDesc: 'Mini Modding / Arguing with mods',
    description:
      '**Avoid mini-modding or arguing with moderators in chat.** If you see rules being broken, please use our custom report feature or open a support ticket instead of taking matters into your own hands. Our staff team volunteer their time to ensure a positive environment, and their decisions are always made with the community\'s best interests at heart. If you ever have concerns regarding a decision we\'ve made, we welcome you to open a ticket or direct message a senior staff member or admin.',
    extended: [],
    active: true,
  },
  violence: {
    ruleNumber: 9,
    shortDesc: 'Unwilling to step back / de-escalate',
    description:
      '**Keep in mind effective conflict resolution and interpersonal skills.** Practise effective de-escalation—everyone has different ways of doing this, but some common tactics include conceding several points and then changing the topic, agreeing to disagree, stepping back from the conversation outright, calling a chat mod to mediate, and/or being the first to apologise.',
    extended: [],
    active: true,
  },
  spam: {
    ruleNumber: 10,
    shortDesc: 'Spam/Self promotion',
    description:
      '**No spam or self-promotion.** Including by not limited to `[server invites, advertisements, etc.]`, **unless given explicit permission from a staff member.** This includes sending unsolicited server invites, advertisements, or direct messages with the intention of promoting content.',
    extended: [],
    active: true,
  },
  offtopic: {
    ruleNumber: 11,
    shortDesc: 'Not on topic',
    description:
      '**Keep on-topic in all channels.** We understand conversations naturally drift; however, if they do not self-correct after a while, a mod may step in to help do so.',
    extended: [],
    active: true,
  },
  nonenglish: {
    ruleNumber: 12,
    shortDesc: 'Non-English conversations',
    description:
      '**Keep all conversations in English.** Short phrases or jokes in another language are allowed, but we cannot effectively moderate non-English extensive discussions.',
    extended: [],
    active: true,
  },
  other: {
    ruleNumber: 13,
    shortDesc: 'Other',
    description:
      'This is a catch-all rule to allow moderators to moderate actions which otherwise wouldn\'t be contained in any rule. Moderators reserve the right to moderate users who are not breaking any stated rules but are otherwise disrupting the safe space. Such actions will be reviewed by other staff, but if you want to appeal a bad moderation decision please also open a ticket',
    extended: [],
    active: true,
    extraCategories: ['rule-other'],
  },
};

export default config;
