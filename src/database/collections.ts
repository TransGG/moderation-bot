import UserLog from './collections/userLogs.js';
import ModerationLog from './collections/userLogs/moderationLogs.js';
import ReportLog from './collections/userLogs/reportLogs.js';

const COLLECTIONS = {
  UserLog,
  ModerationLog,
  ReportLog
};

// TODO: insert chokidar hot reload shenanigans here

export default COLLECTIONS;
