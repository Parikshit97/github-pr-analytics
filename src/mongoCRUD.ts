import { MongoClient, Db, Collection, WithId, Document } from 'mongodb';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017';
const dbName = 'github_analytics';

let client: MongoClient;
let db: Db;

export async function connectToDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log('Connected to MongoDB');
  return db;
}


async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    const database = await connectToDB();
    return database.collection<T>(collectionName);
  }

export interface UserRequestLog {
  userId: string;
  owner: string;
  repo: string;
  endpoint: string;
  requestedAt: Date;
  status: 'success' | 'failure';
  responseTimeMs?: number;
  error?: string;
}

export async function logUserRequest(log: UserRequestLog) {
  const collection = await getCollection<UserRequestLog>('request_logs');
  await collection.insertOne(log);
}

export async function closeConnection() {
  if (client) await client.close();
}
