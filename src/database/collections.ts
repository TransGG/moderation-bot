import UserLog from './collections/userLogs.js';
import ModerationLog from './collections/subcollections/userLogs/collections.userLogs.moderationLogs.js';
import ReportLog from './collections/subcollections/userLogs/collections.userLogs.reportLogs.js';

const COLLECTIONS = {
  UserLog,
  ModerationLog,
  ReportLog
};

// TODO: insert chokidar hot reload shenanigans here

export default COLLECTIONS;
