import _ from 'lodash';
import type { Message, Snowflake, User } from 'discord.js';
import type { ObjectId } from 'mongodb';
import type ModerationLogT from './subcollections/userLogs/collections.userLogs.moderationLogs.js';
import type ReportLogT from './subcollections/userLogs/collections.userLogs.reportLogs.js';
import DATABASE from '../database.js';
import { t } from '../../utils.js';

const DATABASE_COLLECTION = DATABASE.collection('user-logs');
export const ModerationLog =
  (await import(t('./subcollections/userLogs/collections.userLogs.moderationLogs.js')))
    .default as typeof ModerationLogT;

export const ReportLog =
  (await import(t('./subcollections/userLogs/collections.userLogs.reportLogs.js')))
    .default as typeof ReportLogT;

export default class UserLog {
  public readonly _id?: ObjectId;
  public readonly userID: Snowflake;
  public readonly moderationLogs: ModerationLogT[] = [];
  public readonly reportLogs: ReportLogT[] = [];

  constructor(userID: Snowflake) {
    this.userID = userID;
  }

  static async getUserLog(userID: Snowflake) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID });
    return DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(userID);
  }

  static async newModLog(
    moderatorID: Snowflake,
    user: User,
    action: string,
    reason: string,
    rule?: number[],
    privateNotes?: string,
    timeoutDuration?: number,
    message?: Message
  ) {
    const MODERATION_LOG = new ModerationLog(
      moderatorID,
      user,
      action,
      reason,
      rule,
      privateNotes,
      timeoutDuration,
      message
    );
    const USER_LOG = await UserLog.getUserLog(user.id);
    USER_LOG.moderationLogs.push(MODERATION_LOG);
    await USER_LOG.update();
    return MODERATION_LOG;
  }

  static async newReportLog(
    reason: string,
    reporter: User,
    reportedUser: User,
    message: Message
  ) {
    const REPORT_LOG = new ReportLog(reason, reporter, reportedUser, message);
    const USER_LOG = await UserLog.getUserLog(reportedUser.id);
    USER_LOG.reportLogs.push(REPORT_LOG);
    await USER_LOG.update();
    return REPORT_LOG;
  }

  private async update() {
    if (!this._id) return await DATABASE_COLLECTION.insertOne(this);
    else return await DATABASE_COLLECTION.updateOne({ _id: this._id }, { $set: this });
  }
}