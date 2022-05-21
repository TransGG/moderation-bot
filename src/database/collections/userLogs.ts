import type { Snowflake, User } from "discord.js";
import DATABASE from "../database.js";

const DATABASE_COLLECTION = DATABASE.collection('user-logs');

class ModerationLog {
  logID: EpochTimeStamp = Date.now();
  userState?: User;

  moderator: Snowflake;
  reason: string;

  rule?: string;
  privateNotes?: string;
  action?: string;

  constructor(moderator: Snowflake, reason: string, rule?: string, privateNotes?: string, action?: string, userState?: User) {
    this.moderator = moderator;
    this.reason = reason;

    if (rule) this.rule = rule;
    if (privateNotes) this.privateNotes = privateNotes;
    if (action) this.action = action;

    if (userState) this.userState = userState;
  }
}

export default class UserLog {
  public readonly userID: Snowflake;
  public readonly moderationLogs: ModerationLog[] = [];

  constructor(userID: Snowflake) {
    this.userID = userID;
  }

  static async moderateUser(user: User, moderatorID: Snowflake, reason: string, rule?: string, privateNotes?: string, action?: string) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID: user.id });
    const LOG = DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(user.id);

    LOG.moderationLogs.push(new ModerationLog(
      moderatorID,
      reason,
      rule,
      privateNotes,
      action,
      user
    ));
    
    if (!DOCUMENT) return await DATABASE_COLLECTION.insertOne(LOG);
    else return await DATABASE_COLLECTION.updateOne({ _id: DOCUMENT._id }, { $set: LOG });
  }

  static async getUserLog(userID: Snowflake) {
    const DOCUMENT = await DATABASE_COLLECTION.findOne({ userID });
    return DOCUMENT ?
      Object.setPrototypeOf(DOCUMENT, UserLog.prototype) as UserLog :
      new UserLog(userID);
  }
}