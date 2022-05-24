import _ from 'lodash';
import type { Message, Snowflake, User } from 'discord.js';
import DATABASE from '../database.js';

const DATABASE_COLLECTION = DATABASE.collection('user-logs');

function getUserState(user: User) {
  return _.pick(user,
    [
      'accentColor',
      'avatar',
      'banner',
      'discriminator',
      'flags',
      'username'
    ]);
}

function getMessageInfo(message: Message) {
  return _.pick(message,
    [
      'activity',
      'applicationId',
      'attachments',
      'channelId',
      'components',
      'content',
      'createdTimestamp',
      'editedTimestamp',
      'embeds',
      'flags',
      'guildId',
      'id',
      'interaction',
      'stickers',
      'tts'
    ]);
}

export class ModerationLog {
  timestamp: EpochTimeStamp = Date.now();
  userState?: ReturnType<typeof getUserState>;
  messageInfo?: ReturnType<typeof getMessageInfo>;

  moderator: Snowflake;
  reason: string;

  timeoutDuration?: number;
  rule?: number[];
  privateNotes?: string;
  action: string;

  constructor(
    moderator: Snowflake,
    action: string,
    reason: string,
    rule?: number[],
    privateNotes?: string,
    timeoutDuration?: number,
    user?: User,
    message?: Message
  ) {
    this.moderator = moderator;
    this.reason = reason;
    this.action = action;

    if (rule) this.rule = rule;
    if (privateNotes) this.privateNotes = privateNotes;
    if (action === 'timeout' && timeoutDuration) this.timeoutDuration = timeoutDuration;

    if (user) this.userState = getUserState(user);
    if (message) this.messageInfo = getMessageInfo(message)
  }
}

export default class UserLog {
  public readonly userID: Snowflake;
  public readonly moderationLogs: ModerationLog[] = [];

  constructor(userID: Snowflake) {
    this.userID = userID;
  }

  static async newLog(
    moderatorID: Snowflake,
    user: User,
    action: string,
    reason: string,
    rule?: number[],
    privateNotes?: string,
    timeoutDuration?: number,
    message?: Message
  ) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID: user.id });
    const USER_LOG = DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(user.id);

    const MODERATION_LOG = new ModerationLog(
      moderatorID,
      action,
      reason,
      rule,
      privateNotes,
      timeoutDuration,
      user,
      message
    );

    USER_LOG.moderationLogs.push(MODERATION_LOG);

    if (!DOCUMENT) await DATABASE_COLLECTION.insertOne(USER_LOG);
    else await DATABASE_COLLECTION.updateOne({ _id: DOCUMENT._id }, { $set: USER_LOG });

    return MODERATION_LOG;
  }

  static async getUserLog(userID: Snowflake) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID });
    return DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(userID);
  }
}