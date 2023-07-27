import {
  type Interaction,
  Client,
  GuildMember,
  Message,
  User,
  Colors
} from 'discord.js';
import {
  SlashCommandBooleanOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from '@discordjs/builders';
import { type APIApplicationCommandOptionChoice, ChannelType } from 'discord-api-types/v10';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import COLLECTIONS from '@database/collections.js';
import EMBEDS from '../embeds.js';
import { getCustomisations, getRules, getSnowflakeMap } from '@utils.js';
import type ModerationLog from '@database/collections/subcollections/userLogs/collections.userLogs.moderationLogs.js';

function getBasicOptions(interaction: Interaction, options: Partial<OverrideActionOptions>) {
  const DELETE_MESSAGE = options['delete-message'] ?? (interaction.isChatInputCommand() ? interaction.options.getBoolean('delete-message', false) : undefined) ?? undefined;
  const ACTION = options['action'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('action', true) : null);
  if (ACTION === null) throw new Error('ACTION must be defined either by using a CommandInteraction or an OverrideActionOptions with it set');
  const REASON = options['reason'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('reason', true) : null);
  if (REASON === null) throw new Error('REASON must be defined either by using a CommandInteraction or an OverrideActionOptions with it set');
  const PRIVATE_NOTES = options['private-notes'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('private-notes', false) : undefined);
  const RULE = options['rule'] ?? JSON.parse((interaction.isChatInputCommand() ? interaction.options.getString('rule', false) : null) ?? 'null');

  return {
    DELETE_MESSAGE,
    ACTION,
    REASON,
    PRIVATE_NOTES,
    RULE,
  };
}

export async function getRuleDescriptions(rule: string): Promise<string> {
  const RULES = await getRules();

  const RESOLVED_RULE = RULES[rule] ?? {
    ruleNumber: 0,
    shortDesc: `Deleted rule; (${rule})`,
  }
  return `${RESOLVED_RULE?.ruleNumber}. ${RESOLVED_RULE?.shortDesc ?? 'Unknown rule'}`;
}

const durations = {
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
  millisecond: 1
}

async function sendToSrNotifyChannel(
  client: Client,
  message: string
): Promise<void> {
  const SNOWFLAKE_MAP = await getSnowflakeMap();
  const LOG_CHANNEL = await client.channels.fetch(SNOWFLAKE_MAP.Sr_Notify_Channel);

  if (
    !LOG_CHANNEL ||
    (LOG_CHANNEL.type !== ChannelType.GuildText &&
      LOG_CHANNEL.type !== ChannelType.GuildAnnouncement &&
      LOG_CHANNEL.type !== ChannelType.PublicThread &&
      LOG_CHANNEL.type !== ChannelType.PrivateThread &&
      LOG_CHANNEL.type !== ChannelType.AnnouncementThread &&
      LOG_CHANNEL.type !== ChannelType.DM)
  ) return;

  try {
    await LOG_CHANNEL.send({
      content: message,
      allowedMentions: { parse: [], roles: SNOWFLAKE_MAP.Sr_Staff_Roles },
    });
  } catch {
    // If sending fails, it's far more important to ignore it and do the action anyway then worry and stop
  }
}

async function sendToLogChannel(
  client: Client,
  user: User,
  log: ModerationLog,
  extraActionOptions: ExtraActionOptions
): Promise<void> {
  const SNOWFLAKE_MAP = await getSnowflakeMap();

  const LOG_EMBED = await EMBEDS.logNotice(client, user, log, extraActionOptions);

  const RULES = await getRules();

  const LOG_CHANNEL_CATEGORIES = [log.action];
  for (const CATEGORY of RULES[log.rule]?.extraCategories ?? [])
    LOG_CHANNEL_CATEGORIES.push(String(CATEGORY));

  const LOG_CHANNELS = LOG_CHANNEL_CATEGORIES.flatMap((CATEGORY) => {
    return (
      SNOWFLAKE_MAP.Mod_Logs_Channels[CATEGORY] ??
      SNOWFLAKE_MAP.Mod_Logs_Channels['default'] ??
      []
    );
  }).filter((item, index, array) => array.indexOf(item) === index);

  for (const MOD_LOG_CHANNEL of LOG_CHANNELS) {
    const LOG_CHANNEL = await client.channels.fetch(MOD_LOG_CHANNEL);

    if (
      !LOG_CHANNEL ||
      (LOG_CHANNEL.type !== ChannelType.GuildText &&
        LOG_CHANNEL.type !== ChannelType.GuildAnnouncement &&
        LOG_CHANNEL.type !== ChannelType.PublicThread &&
        LOG_CHANNEL.type !== ChannelType.PrivateThread &&
        LOG_CHANNEL.type !== ChannelType.AnnouncementThread &&
        LOG_CHANNEL.type !== ChannelType.DM)
    )
      continue;

    try {
      await LOG_CHANNEL.send({
        embeds: [LOG_EMBED],
        allowedMentions: { parse: [] },
      });
    } catch {
      // If sending fails, it's far more important to ignore it and do the action anyway then worry and stop
    }
  }
}

async function validateDuration(
  interaction: Interaction,
  options: Partial<OverrideActionOptions>,
): Promise<[boolean, number | undefined]> {
  if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return [false, undefined];
  // duration must be specific only if the action is a timeout
  const ACTION = options['action'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('action', true) : null);
  if (ACTION === null) throw new Error('ACTION must be defined either by using a CommandInteraction or an OverrideActionOptions with it set');
  if (ACTION !== 'timeout' && ACTION !== 'ban') return [true, undefined];

  const INPUT = options['duration'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('duration', false) : null);
  if (!INPUT)
    if (ACTION === 'ban')
      return [true, 0];
    else {
      await interaction.followUp({
        content: 'Timeout duration must be specified',
        ephemeral: true,
      });
      return [false, undefined];
    }

  if (!/^(?: *\d+(\.\d+)?[DHMS] *)+$/i.test(INPUT)) {
    await interaction.followUp({
      content:
        'Invalid duration format, example: `1h 30m 10s`\nMatch the regex: `/^(?: *\\d+[DHMS] *)+$/i`',
      ephemeral: true,
    });
    return [false, undefined];
  }

  let duration = 0;
  if (INPUT)
    for (const TIME of <RegExpMatchArray>INPUT.match(/\d+(\.\d+)?[DHMS]/gi)) {
      const TIME_GROUP = <{ [key in 'amount' | 'unit']: string }>(
        TIME.match(/(?<amount>\d+(\.\d+)?)(?<unit>[DHMS])/i)?.groups
      );
      switch (TIME_GROUP.unit.toUpperCase()) {
      case 'W':
        duration += Number(TIME_GROUP.amount) * durations.week;
        break;
      case 'D':
        duration += Number(TIME_GROUP.amount) * durations.day;
        break;
      case 'H':
        duration += Number(TIME_GROUP.amount) * durations.hour;
        break;
      case 'M':
        duration += Number(TIME_GROUP.amount) * durations.minute;
        break;
      case 'S':
        duration += Number(TIME_GROUP.amount) * durations.second;
        break;
      }
    }

  if (ACTION === 'ban')
    duration = Math.min(duration, durations.week); // Bans can delete messages for no longer than 1 week
  else if (ACTION === 'timeout')
    duration = Math.min(duration, 28 * durations.day); // Timeouts can be for no longer than 28 days

  return [true, duration];
}

async function sendNotice(
  USER: User,
  LOG: ModerationLog,
  interaction: Interaction,
) {
  if (!interaction.isCommand()) return;
  try {
    await (
      await USER.createDM()
    ).send({
      embeds: [await EMBEDS.moderationNotice(LOG)],
    });
  } catch {
    return await interaction.followUp({
      content:
        'Could not send the notice to this user, they likely have their DMs disabled',
      ephemeral: true,
    });
  }
  return await interaction.followUp({
    content: 'Notice sent',
    ephemeral: true,
  });
}

export interface ExtraActionOptions {
  sendNoticeFirst?: boolean;
  noNotice?: boolean;
  emoji: string;
  pastTense: string;
  color: number
}

export interface OverrideActionOptions {
  user: User;
  'message-id': string;
  'delete-message': boolean;
  'action': string;
  reason: string;
  rule: string;
  duration: string;
  'private-notes': string;
}

export default class ActionCommand extends ResponsiveSlashCommandSubcommandBuilder {
  private readonly type: 'user' | 'message';

  static readonly actions: [
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember, reason: string) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (
        member: GuildMember,
        reason: string,
        duration?: number
      ) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember, reason: string) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember, reason: string, days?: number) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember, reason: string) => Promise<boolean>,
      ExtraActionOptions
    ],
    [
      APIApplicationCommandOptionChoice<string>,
      (member: GuildMember) => Promise<boolean>,
      (member: GuildMember, reason: string) => Promise<boolean>,
      ExtraActionOptions
    ],
  ] = [
      [
        {
          name: 'Verify',
          value: 'verify',
        },
        async (member) => {
          return member.manageable;
        },
        async (member, reason) => {
          if (!member.manageable) return false;
          const SNOWFLAKE_MAP = await getSnowflakeMap();
          return !!(await member.roles.add(SNOWFLAKE_MAP.Verified_Roles, reason));
        },
        { emoji: ':white_check_mark:', pastTense: 'Verified', color: Colors.Green },
      ],
      [
        {
          name: 'Add Note',
          value: 'add_note',
        },
        async (member) => {
          return Boolean(await member.fetch());
        },
        async (member) => {
          return Boolean(await member.fetch());
        },
        {
          noNotice: true,
          emoji: ':pencil:',
          pastTense: 'Added a note to',
          color: Colors.Yellow,
        },
      ],
      [
        {
          name: 'Warn',
          value: 'warn',
        },
        async (member) => {
          return member.manageable;
        },
        async (member) => {
          if (!member.manageable) return false;
          return true;
        },
        { emoji: ':warning:', pastTense: 'Warned', color: Colors.Yellow },
      ],
      [
        {
          name: 'Timeout',
          value: 'timeout',
        },
        async (member) => {
          return member.moderatable;
        },
        async (member, reason, duration) => {
          if (!member.moderatable) return false;
          return !!(await member.timeout(duration ?? null, reason));
        },
        { emoji: ':mute:', pastTense: 'Timed out', color: Colors.Orange },
      ],
      [
        {
          name: 'Kick',
          value: 'kick',
        },
        async (member) => {
          return member.kickable;
        },
        async (member, reason) => {
          if (!member.kickable) return false;
          return !!(await member.kick(reason));
        },
        { sendNoticeFirst: true, emoji: ':boot:', pastTense: 'Kicked', color: Colors.Red },
      ],
      [
        {
          name: 'Ban',
          value: 'ban',
        },
        async (member) => {
          return member.bannable;
        },
        async (member, reason, DURATION = 0) => {
          if (!member.bannable) return false;
          return !!(await member.ban({ reason, deleteMessageSeconds: DURATION ? Math.trunc(DURATION / 1000) : 0 }));
        },
        { sendNoticeFirst: true, emoji: ':hammer:', pastTense: 'Banned', color: 0xe63624 },
      ],
      [
        {
          name: 'Add Mature',
          value: 'add_mature',
        },
        async (member) => {
          return member.manageable;
        },
        async (member, reason) => {
          if (!member.manageable) return false;
          const SNOWFLAKE_MAP = await getSnowflakeMap();
          return !!(await member.roles.add(SNOWFLAKE_MAP.Mature_Roles, reason));
        },
        { emoji: ':white_check_mark:', pastTense: 'Gave the mature role to', color: Colors.Green },
      ],
      [
        {
          name: 'Remove Mature',
          value: 'remove_mature',
        },
        async (member) => {
          return member.manageable;
        },
        async (member, reason) => {
          if (!member.manageable) return false;
          const SNOWFLAKE_MAP = await getSnowflakeMap();
          return !!(await member.roles.remove(SNOWFLAKE_MAP.Mature_Roles, reason));
        },
        { emoji: ':white_check_mark:', pastTense: 'Removed the mature role from', color: Colors.Yellow },
      ],
    ];

  public constructor(type: 'user' | 'message') {
    super();
    this.type = type;
    (type === 'user'
      ? this.addUserParameters()
      : this.addMessageParameters()
    ).addBaseParameters();
  }

  override readonly response = async (
    interaction: Interaction,
    _interactionHandler: InteractionHandler,
    command: this,
    options?: Partial<OverrideActionOptions>
  ): Promise<void> => {
    if (!interaction.isContextMenuCommand() && !interaction.isChatInputCommand())
      throw new Error('An invalid interaction type was passed into the ActionCommand response method');

    if (options === undefined) options = {};
    if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });

    const SNOWFLAKE_MAP = await getSnowflakeMap();

    // TODO: https://discord.com/channels/@me/960632564912115763/981297877131333642
    // get basic options
    const { DELETE_MESSAGE, ACTION, REASON, PRIVATE_NOTES, RULE } =
      getBasicOptions(interaction, options);

    const [IS_VALID_DURATION, DURATION] = await validateDuration(interaction, options);

    if (!IS_VALID_DURATION) return;

    let message: Message | undefined;
    if (command.type === 'message') {
      try {
        const messageId = options['message-id'] ?? (interaction.isChatInputCommand() ? interaction.options.getString('message-id', true) : null);
        if (messageId === null) throw new Error('For message ActionCommands, message-id must be defined either by using a CommandInteraction or an OverrideActionOptions with it set');
        message = await interaction.channel?.messages.fetch(
          messageId
        );
      } catch {
        // If the message isn't in the same channel we won't be able to fetch it
      }
      if (!message) {
        await interaction.followUp({
          content: 'Message not found',
          ephemeral: true,
        });
        return;
      }
    }


    const USER = message
      ? message.author
      : options['user'] ?? (interaction.isChatInputCommand() ? interaction.options.getUser('user', true) : null);
    if (USER === null) throw new Error('USER must be defined either by using a CommandInteraction, an OverrideActionOptions with it set or a message ActionCommand where it can be inferred from the message author');
    let member: GuildMember | undefined;
    try {
      member = await interaction.guild?.members.fetch(USER.id);
    } catch {
      // Sometimes we won't be able to fetch a member (i.e. if they aren't in the server).
    }

    const action = ActionCommand.actions.find(
      (action) => action[0].value === ACTION
    );

    if (!action) {
      console.log(`Action ${ACTION} not found, ignoring...`);
      return;
    }

    const CUSTOMISATIONS = await getCustomisations()

    // @ts-expect-error - If action is not valid, default will be used instead.
    const DAILY_ACTION_LIMITS = CUSTOMISATIONS.Daily_Action_Limits[ACTION] ?? CUSTOMISATIONS.Daily_Action_Limits['default']
    // @ts-expect-error - If action is not valid, false is used as the default.
    const STAFF_CANT_PUNISH_STAFF_RESTRICTION = CUSTOMISATIONS.Staff_Cant_Punish_Staff_Restriction[ACTION] ?? true;

    const activity = await COLLECTIONS.UserLog.checkModeratorActivityInTime(interaction.user.id, ACTION, durations.day);
    if (activity.length >= DAILY_ACTION_LIMITS) {
      await interaction.followUp({
        content:
          `Failed to perform action on a user: ${USER}. You have performed ${activity.length} ${ACTION} actions in the last 24 hours. (Limit: ${DAILY_ACTION_LIMITS})`,
        ephemeral: true,
      });

      await sendToSrNotifyChannel(interaction.client, `${SNOWFLAKE_MAP.Sr_Staff_Roles.map(u => `<@&${u}>`).join(', ')}\nModerator ${interaction.user} has exceeded their daily action limit of ${DAILY_ACTION_LIMITS} ${ACTION} actions in the last 24 hours.`)

      return;
    }

    // console.log(`Action Performed: ${ACTION} on ${USER.id}, not in cooldown (limit: ${DAILY_ACTION_LIMITS}) | Actions: ${activity.length}`);

    if (DELETE_MESSAGE && message?.deletable) await message.delete();

    if (!member) {
      if (ACTION === 'ban') {

        try {
          const bannedUser = await interaction.guild?.members.ban(USER.id, {
            reason: REASON,
            deleteMessageSeconds: DURATION ? Math.trunc(DURATION / 1000) : 0,
          });
          const LOG = await COLLECTIONS.UserLog.newModLog(
            interaction.user.id,
            USER,
            ACTION,
            REASON,
            RULE,
            PRIVATE_NOTES ?? undefined,
            DURATION,
            message
          );
          await sendToLogChannel(interaction.client, USER, LOG, action[3]);
          await interaction.followUp({
            content: `Banned out-of-server member ${typeof bannedUser === 'object'
              ? `${(bannedUser as User).tag} (${bannedUser.id})`
              : bannedUser
            }`,
          });
          return;
        } catch (e) {
          console.log(`Failed to ban a user: ${e}`);
          await interaction.followUp({
            content:
              'I couldn\'t ban that user, check that you provided the right ID',
            ephemeral: true,
          });
          return;
        }
      }

      if (ACTION === 'add_note') {
        const LOG = await COLLECTIONS.UserLog.newModLog(
          interaction.user.id,
          USER,
          ACTION,
          REASON,
          RULE,
          PRIVATE_NOTES ?? undefined,
          DURATION,
          message
        )
        await sendToLogChannel(interaction.client, USER, LOG, action[3]);

        await interaction.followUp(`Successfully logged note for out-of-server user ${USER}`);
        return;
      }

      await interaction.followUp({
        content: 'User not found in this server',
        ephemeral: true,
      });
      return;
    }

    if (STAFF_CANT_PUNISH_STAFF_RESTRICTION && member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles)) {
      await interaction.followUp({
        content: 'You cannot take this action on staff members',
        ephemeral: true,
      });
      return;
    }

    const LOG = await COLLECTIONS.UserLog.newModLog(
      interaction.user.id,
      USER,
      ACTION,
      REASON,
      RULE,
      PRIVATE_NOTES ?? undefined,
      DURATION,
      message
    );


    if (!(await action[1](member))) {
      await interaction.followUp({
        content:
          'You cannot take action on members with higher permission than this bot',
        ephemeral: true,
      });
      return;
    }

    await sendToLogChannel(interaction.client, USER, LOG, action[3]);
    if (action[3].sendNoticeFirst && !action[3].noNotice) await sendNotice(USER, LOG, interaction);

    if (!(await action[2](member, REASON, DURATION))) {
      await interaction.followUp({
        content:
          'Something went wrong while trying to punish the user, please make sure you have permission',
        ephemeral: true,
      });
      return;
    }

    if (!action[3].sendNoticeFirst && !action[3].noNotice) {
      await sendNotice(USER, LOG, interaction);
    } else if (action[3].noNotice) {
      await interaction.followUp(`Successfully added note for ${member}`);
    }
  };

  private addUserParameters() {
    return this.addUserOption(
      new SlashCommandUserOption()
        .setName('user')
        .setDescription('The user to take action on')
        .setRequired(true)
    );
  }

  private addMessageParameters() {
    return this.addBooleanOption(
      new SlashCommandBooleanOption()
        .setName('delete-message')
        .setDescription('Whether to delete the specified message')
        .setRequired(true)
    ).addStringOption(
      new SlashCommandStringOption()
        .setName('message-id')
        .setDescription('The message to take action on')
        .setRequired(true)
    );
  }

  private async addBaseParameters() {
    return this.addStringOption(
      new SlashCommandStringOption()
        .setName('action')
        .setDescription('The action to take')
        .addChoices(...ActionCommand.actions.map((action) => action[0]))
        .setRequired(true)
    )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('reason')
          .setDescription('The reason for the action')
          .setRequired(true)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('rule')
          .setDescription('The rule to apply')
          .addChoices(
            ...(await (async () => {
              const RULES: APIApplicationCommandOptionChoice<string>[] = [];
              Object.entries(await getRules())
                .sort(
                  ([_aID, aRule], [_bID, bRule]) =>
                    aRule.ruleNumber - bRule.ruleNumber
                )
                .forEach(([key, rule]) => {
                  if (!rule.active) return;
                  RULES.push({
                    name: `${rule.ruleNumber}. ${rule.shortDesc}`,
                    value: JSON.stringify([key]),
                  });

                  // FIXME: extended rules exceed 25 choices limit
                  //rule.extended?.forEach((extended, j) => {
                  //  if (!extended.active) return;
                  //  RULES.push({name: `${rule.index}.${extended.index}. ${extended.shortDesc}`, value: `${i}.${j}`});
                  //});
                });

              return RULES;
            })())
          )
          .setRequired(true)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('duration')
          .setDescription('Duration of the timeout for timeouts or duration to delete past messages for bans')
          .setRequired(false)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('private-notes')
          .setDescription('Private notes to add')
          .setRequired(false)
      );
  }
}
