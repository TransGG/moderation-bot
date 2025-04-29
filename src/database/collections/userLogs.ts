import _ from 'lodash';
import type { Message, Snowflake, User } from 'discord.js';
import type { ObjectId } from 'mongodb';
import type ModerationLogT from './userLogs/moderationLogs.js';
import type ReportLogT from './userLogs/reportLogs.js';
import DATABASE from '../database.js';
import { t } from '@utils.js';
import config from 'configs/core.js';

const DATABASE_COLLECTION = DATABASE.collection('user-logs');
export const ModerationLog =
  (await import(t`./userLogs/moderationLogs.js`))
    .default as typeof ModerationLogT;

export const ReportLog =
  (await import(t`./userLogs/reportLogs.js`))
    .default as typeof ReportLogT;

let cachedAltSwitchLogs: Map<string, string[]> | undefined;
let cachedAltLogsAt = 0;

async function fetchAltSwitchLogs() {
  if (Date.now() - cachedAltLogsAt < 5 * 60 * 1000 && cachedAltSwitchLogs) return cachedAltSwitchLogs;
  const request = await fetch(config.Alt_Account_Sheet_URL);
  const text = request.ok ? await request.text() : '';
  const rows = text.split('\n')
    .slice(1)
    .map((line) => line.split(','))
    .map((row) => [row[1]?.trim(), row[4]?.trim()] as [string, string]);
  const graph = new Map<string, string[]>();
  for (const [a, b] of rows) {
    graph.set(a, [...graph.get(a) ?? [], b]);
    graph.set(b, [...graph.get(b) ?? [], a]);
  }
  cachedAltLogsAt = Date.now();
  return (cachedAltSwitchLogs = graph);
}

export default class UserLog {
  public readonly _id?: ObjectId;
  public readonly userID: Snowflake;
  public readonly moderationLogs: ModerationLogT[] = [];
  public readonly reportLogs: ReportLogT[] = [];
  // TODO: put report banned users in database instead

  public constructor(userID: Snowflake) {
    this.userID = userID;
  }

  public static async getUserAndConnectedLogs(userID: Snowflake) {
    const graph = await fetchAltSwitchLogs();
    const ids = [userID];
    const open = [userID];
    while (open.length > 0) {
      const id = open.shift();
      if (!id) break;
      for (const conn of graph.get(id) ?? []) {
        if (ids.includes(conn)) continue;
        ids.push(conn);
        open.push(conn);
      }
    }
    return await DATABASE_COLLECTION.find({ userID: { $in: ids } })
      .map((log) => Object.setPrototypeOf(log, UserLog.prototype) as UserLog)
      .toArray();
  }

  public static async getUserLog(userID: Snowflake) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID });
    return DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(userID);
  }

  public static async setHidden(userID: Snowflake, indexModLog: number, newValue: boolean) {
    const USER_LOG = await UserLog.getUserLog(userID);

    const MOD_LOG = USER_LOG.moderationLogs[indexModLog];
    if (MOD_LOG) {
      MOD_LOG.isHidden = newValue;
    }

    await USER_LOG.update();
  }

  public static async checkModeratorActivityInTime(
    moderatorID: Snowflake,
    action: string,
    timeInMs: number
  ) {
    // Find all actions by this moderator in the last 24 hours with this action
    const ACTIONS = await DATABASE_COLLECTION.aggregate([
      { $match: { 'moderationLogs.moderator': moderatorID } },
      { $unwind: '$moderationLogs' },
      { $match: { 'moderationLogs.moderator': moderatorID } },
      { $match: { 'moderationLogs.action': action } },
      { $match: { 'moderationLogs.timestamp': { $gte: Date.now() - timeInMs } } },
    ]).toArray();

    return ACTIONS;
  }


  public static async newModLog(
    moderatorID: Snowflake,
    user: User,
    action: string,
    reason: string,
    rule: string,
    privateNotes?: string,
    duration?: number,
    keepMessage?: boolean,
    message?: Message
  ) {
    const MODERATION_LOG = new ModerationLog(
      moderatorID,
      user,
      action,
      reason,
      rule,
      privateNotes,
      duration,
      keepMessage,
      message
    );
    const USER_LOG = await UserLog.getUserLog(user.id);
    USER_LOG.moderationLogs.push(MODERATION_LOG);
    await USER_LOG.update();
    return MODERATION_LOG;
  }

  public static async newReportLog(
    reason: string,
    reporter: User,
    reportedUser: User,
    message?: Message
  ) {
    const REPORT_LOG = new ReportLog(reason, reporter, reportedUser, message);
    const USER_LOG = await UserLog.getUserLog(reportedUser.id);
    USER_LOG.reportLogs.push(REPORT_LOG);
    await USER_LOG.update();
    return REPORT_LOG;
  }

  /**
   * Add the user to the database if they haven't been added before
   *
   * Updates the user if they have been added before
   */
  private async update() {
    if (!this._id) return await DATABASE_COLLECTION.insertOne(this);
    else return await DATABASE_COLLECTION.updateOne({ _id: this._id }, { $set: this });
  }
}
