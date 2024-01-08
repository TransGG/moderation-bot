import _ from 'lodash';
import type { User, Message, Snowflake } from 'discord.js';

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
  public readonly timestamp: EpochTimeStamp = Date.now();
  public readonly userState: ReturnType<typeof getUserState>;
  public readonly messageInfo?: ReturnType<typeof getMessageInfo>;
  public readonly keepMessage?: boolean

  public readonly moderator: Snowflake;
  public readonly reason: string;

  public readonly duration?: number;
  public readonly rule: string;
  public readonly privateNotes?: string;
  public readonly action: string;

  public constructor(
    moderator: Snowflake,
    user: User,
    action: string,
    reason: string,
    rule: string,
    privateNotes?: string,
    duration?: number,
    keepMessage?: boolean,
    message?: Message
  ) {
    this.moderator = moderator;
    this.userState = getUserState(user);
    this.reason = reason;
    this.action = action;

    this.rule = rule;
    if (privateNotes) this.privateNotes = privateNotes;
    if ((action === 'timeout' || action === 'ban') && duration) this.duration = duration;
    if (keepMessage) this.keepMessage = keepMessage;
    if (message) this.messageInfo = getMessageInfo(message);
  }
}
