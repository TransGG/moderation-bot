import _ from "lodash";
import type { User, Message, Snowflake } from "discord.js";

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

export default class ModerationLog {
  timestamp: EpochTimeStamp = Date.now();
  userState: ReturnType<typeof getUserState>;
  messageInfo?: ReturnType<typeof getMessageInfo>;

  moderator: Snowflake;
  reason: string;

  timeoutDuration?: number;
  rule?: number[];
  privateNotes?: string;
  action: string;

  constructor(
    moderator: Snowflake,
    user: User,
    action: string,
    reason: string,
    rule?: number[],
    privateNotes?: string,
    timeoutDuration?: number,
    message?: Message
  ) {
    this.moderator = moderator;
    this.userState = getUserState(user);
    this.reason = reason;
    this.action = action;

    if (rule) this.rule = rule;
    if (privateNotes) this.privateNotes = privateNotes;
    if (action === 'timeout' && timeoutDuration) this.timeoutDuration = timeoutDuration;
    if (message) this.messageInfo = getMessageInfo(message)
  }
}