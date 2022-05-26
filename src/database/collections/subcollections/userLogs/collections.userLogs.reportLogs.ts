import _ from "lodash";
import type { User, Message } from "discord.js";

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

export default class ReportLog {
  timestamp: EpochTimeStamp = Date.now();
  reason: string;
  reporter: ReturnType<typeof getUserState>;
  reportedUser: ReturnType<typeof getUserState>;
  messageInfo: ReturnType<typeof getMessageInfo>;

  constructor(
    reason: string,
    reporter: User,
    reportedUser: User,
    message: Message
  ) {
    this.reason = reason;
    this.reporter = getUserState(reporter);
    this.reportedUser = getUserState(reportedUser);
    this.messageInfo = getMessageInfo(message);
  }
}