// imports
import chalk from 'chalk';
import { MongoClient } from 'mongodb';
import { getCoreConf } from '@utils.js';

const CONFIG = await getCoreConf();

console.log(chalk.cyanBright('Connecting to MongoDB'));
const MONGO_CLIENT = await new MongoClient(CONFIG.MongoDB_URI).connect();
const DATABASE = MONGO_CLIENT.db('moderation-bot');
console.log(chalk.greenBright('Connected to MongoDB'));

export default DATABASE;
