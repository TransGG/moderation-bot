import type rules from './rulesType';

const config: rules = [
  {
    shortDesc: 'Not on topic',
    description:
      'Keep on-topic in all channels. We understand conversations naturally drift; however, if they do not self-correct after a while, a mod may step in to help do so.',
    extended: [],
    active: true,
  },
  {
    shortDesc: 'NSFW/Age-restricted content',
    description:
      'No age-restricted or obscene content. Our community remains appropriate for anyone over the age of 13, any content deemed unfit for this is disallowed. This includes text, images or links.',
    extended: [
      {
        shortDesc: 'Age-restricted / Lewd / Obscene content',
        description:
          'Absolutely no age-restricted, lewd, or obscene content. This includes text, images or links.',
        active: true,
      },
      {
        shortDesc: 'Excessive flirting',
        description:
          'Keep RP and excessive flirting to DMs, and keep the default channels PG-13. As an example—a simple “I love you” here and there is fine, but talking in detailed innuendo about activities you would like to partake in, in private, is not.',
        active: true,
      },
      {
        shortDesc: 'Not warning NSFW content',
        description:
          'If you are not sure if something’s OK to say or post, ask a mod, or spoiler it with, say, “CW—slight flirt”. There will be no strikes held against you for cautiously posting something you feel unsure about with a CW, even if it is later removed.',
        active: true,
      },
      {
        shortDesc: 'Dating..?',
        description:
          'We are NOT and will NEVER be a sexual or dating server. Attempts to use the server for these purposes will not be tolerated. Even if you have a partner you want to bring here, keep extensive PDAs or “bedroom talk” out of this place.',
        active: true,
      },
      {
        shortDesc: 'Flirting underage..?',
        description:
          'Minors, do NOT flirt with or ask for displays of sexual/romantic affection from adults, and of course vice versa.',
        active: true,
      },
      {
        shortDesc: 'Giving too much information / Manipulation..?',
        description:
          'This is more of a general guideline than exact rule to follow, but try not to open up too much about private information at first when talking with strangers, be aware of people attempting to manipulate/groom you (even if such people would be in the tiny minority), and don’t hesitate to inform a mod if something feels off. Mistakes can be forgiven, but if something clearly goes beyond a mistake, rest assured we will act on it.',
        active: true,
      },
      {
        shortDesc: 'Attempts to circumvent rules',
        description:
          'Follow the spirit, not just the letter, of these rules. Any attempts to circumvent with technicalities will not be allowed.',
        active: true,
      },
    ],
    active: true,
  },
  {
    shortDesc: 'Shocking / Gory content',
    description:
      'No shocking or overly violent/gory content. If something straddles the line, ask a mod, CW, or don’t post it at all.',
    extended: [],
    active: true,
  },
  {
    shortDesc: 'Spam/Self promotion',
    description:
      'No spam or self-promotion (server invites, advertisements. etc.) without permission from a staff member. This includes DMing fellow members.',
    extended: [],
    active: true,
  },
  {
    shortDesc: 'Harassment',
    description:
      'Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism or hate speech will be tolerated.',
    extended: [
      {
        shortDesc: 'Assume good faith first',
        description:
          'Assume good faith and try not to read malice into other people\'s actions. We are all trying our best in these times, and as shown by the final result of r/place, can do great things together if we trust each other and unite. Don\'t treat each other as automatic adversaries or disposable.',
        active: true,
      },
      {
        shortDesc: 'Don\'t assume based on prejudice',
        description:
          'Try not to assume things about other people or topics based on your preexisting stereotypes and biases.',
        active: true,
      },
      {
        shortDesc: 'Don\'t be ableist',
        description:
          'Respect neurodivergence. Many of us have atypical ways of relating to each other due to ADHD, autism, trauma, and/or all of the above.',
        active: true,
      },
      {
        shortDesc: 'Respect good-faith identities',
        description:
          'All good-faith identities, including niche sexuality labels, xenogenders, neopronouns, and plurality types, are to be respected. It is not up to us to police who deserves what label, when everyone knows only their own internal experience firsthand. Let people organically describe their selfhood in their own way, even if it is with a word scheme that we personally would not use.',
        active: true,
      },
      {
        shortDesc: 'No witch-hunting',
        description:
          'Do not harass or witch-hunt others. If you have a grievance, please bring it up to a staff member. Try to keep drama to a minimum.',
        active: true,
      },
    ],
    active: true,
  },
  {
    shortDesc: 'Violent conflict',
    description:
      'Keep in mind effective conflict resolution and interpersonal skills.',
    extended: [
      {
        shortDesc: 'Violet Disagreement',
        description:
          'Be aware that conflict/disagreement is inevitable, but know that it does not have to mean a loss of relationship or community.',
        active: true,
      },
      {
        shortDesc: 'Not apologizing',
        description:
          'Do not be afraid to agree to disagree or apologize, and similarly do not take apologies as a sign of victory or a signal to go on the further offensive.',
        active: true,
      },
      {
        shortDesc: 'Excessive debates / discourse',
        description:
          'Keep debates/discourse down. Minor ideological differences are no reason to tear each other apart. There are many hills you can die on, but few worth dying on.',
        active: true,
      },
      {
        shortDesc: 'Equating conflict to abuse',
        description:
          'Remember that conflict does not equal abuse—even if people are hitting nerves, that does not mean they are engaging in using a power dynamic to purposefully hurt or control you. In these moments, do not go on vendettas, and try your best to see the other side as a human being, and see that they are likely not a person who is trying to bring you pain, nor your enemy.',
        active: true,
      },
      {
        shortDesc: 'Ignoring trauma',
        description:
          'Keep trauma in mind. In these spaces, many people have been hurt in a variety of ways. People are triggered by all sorts of viewpoints or tones, and when heads butt, remember that it may be due to the other side seeing an existential threat where there is less or none in reality (i.e. emotional flashbacks). In these cases, step back instead of escalating, and keep in mind your own triggers as well as calming/coping mechanisms. Try to distinguish things you are upset by because they are your triggers, and things you are upset by because they are categorically bad - the former is grounds for a CW, but the latter for likely further action.',
        active: true,
      },
      {
        shortDesc: 'Refusing to de-escalate',
        description:
          'Practice effective de-escalation—everyone has different ways of doing this, but some common tactics include conceding several points and then changing the topic, agreeing to disagree, stepping back from the conversation outright, calling a chat mod to mediate, and/or being the first to apologize.',
        active: true,
      },
    ],
    active: false,
  },
  {
    shortDesc: 'Hate',
    description: 'Hate has no home here.',
    extended: [
      {
        shortDesc: 'Intolerant ideologies and beliefs',
        description:
          'Intolerant ideologies and beliefs will not be tolerated (see [Wikipedia: Paradox of tolerance](https://en.wikipedia.org/wiki/Paradox_of_tolerance \'Wikipedia: Paradox of tolerance\')). Individuals harboring hateful beliefs (including but not limited to fascism, Nazism, antisemitism, genocide apologia/atrocity denialism, and of course homophobia and transphobia), are subject to disciplinary action or removal even if they technically only openly express them outside the server.',
        active: true,
      },
      {
        shortDesc: 'Hate speech',
        description: 'No hate speech is allowed.',
        active: true,
      },
      {
        shortDesc: 'Slurs',
        description:
          'No slurs will be allowed, even in reclamation (the exceptions are community/self-identifiers which have been widely accepted as being already reclaimed, such as “gay” or “queer”). This is to prevent users from upsetting others with words that have been used for hateful reasons, even if not meant as such in the current context.',
        active: true,
      },
      {
        shortDesc: 'Discrimination for respectability politics',
        description:
          'Identities do not invite abuse. People identifying in certain ways does not cause society to ridicule the group as a whole; bigots will do that anyways, and respectability politics does not pay off. Throwing xenogender people under the bus will not convince mainstream culture to respect us; condemning bi lesbians will not prevent lesbian erasure and predation by toxic masculinity/cishet creeps, and so forth. Discrimination based on thinking along these lines will not be tolerated.',
        active: true,
      },
      {
        shortDesc: 'Uncontextual transphobic screenshots',
        description:
          'Don\'t post screenshots of transphobia without any context, and if you do please remember to spoiler and trigger-warn appropriately.',
        active: true,
      },
    ],
    active: true,
  },
  {
    shortDesc: 'Non-English conversations',
    description:
      'Please keep all conversations in English. Short phrases or jokes in another language are allowed, but we cannot effectively moderate non-English extensive discussions.',
    extended: [],
    active: true,
  },
  {
    shortDesc: 'Other',
    description:
      'This is a catch-all rule to allow moderators to moderate actions which otherwise wouldn\'t be contained in any rule. Moderators reserve the right to moderate users who are not breaking any stated rules but are otherwise disrupting the safe space. Such actions will be reviewed by other staff, but if you want to appeal a bad moderation decision please also open a ticket',
    extended: [],
    active: true,
    extraCategories: ['rule-other'],
  },
];

export default config;
