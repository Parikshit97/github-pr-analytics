import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = 'mongodb://mongo:27017';
const dbName = 'github_analytics';

let client: MongoClient;
let db: Db;

async function connectToDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log('Connected to MongoDB');
  return db;
}

// Get collection helper
async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const database = await connectToDB();
  return database.collection<T>(collectionName);
}

// Upsert PR Timing Metrics
export async function upsertPRTimingMetrics(owner: string, repo: string, metrics: any) {
  const collection = await getCollection('pr_timing_metrics');
  return collection.updateOne(
    { owner, repo },
    { $set: { metrics, updatedAt: new Date() } },
    { upsert: true }
  );
}

// Get PR Timing Metrics by repo and owner
export async function getPRTimingMetrics(owner: string, repo: string) {
  const collection = await getCollection('pr_timing_metrics');
  return collection.findOne({ owner, repo });
}

export async function closeConnection() {
  if (client) await client.close();
}
