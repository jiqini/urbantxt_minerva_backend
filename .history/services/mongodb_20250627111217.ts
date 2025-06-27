import { MongoClient, Db, Collection } from 'mongodb';
import { config } from '../utils/config';

class MongoDBService {
  private client: MongoClient;
  private db: Db;
  private isConnected: boolean = false;

  constructor() {
    this.client = new MongoClient(config.mongodb.uri);
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.db = this.client.db(config.mongodb.dbName);
      this.isConnected = true;
      console.log('Connected to MongoDB Atlas');
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
    }
  }

  getCollection(name: string): Collection {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection(name);
  }

  // Vector search for legal documents
  async vectorSearch(
    embedding: number[],
    limit: number = 5,
    minScore: number = 0.8
  ) {
    const collection = this.getCollection(config.mongodb.collections.legalDocuments);
    
    const pipeline = [
      {
        $vectorSearch: {
          index: 'legal_vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 100,
          limit: limit,
        }
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $match: {
          score: { $gte: minScore }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          source: 1,
          document_type: 1,
          metadata: 1,
          score: 1
        }
      }
    ];

    return await collection.aggregate(pipeline).toArray();
  }
}

export const mongoService = new MongoDBService();