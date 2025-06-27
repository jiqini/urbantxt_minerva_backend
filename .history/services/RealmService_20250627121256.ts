import Realm from 'realm';
// Change this line:
// import { mongoService } from './mongodb';
// To:
import { databaseService } from './mongodb';

// Define Realm schemas for offline storage
class OfflineLegalDocument extends Realm.Object<OfflineLegalDocument> {
  _id!: string;
  title!: string;
  content!: string;
  source!: string;
  document_type!: string;
  metadata!: string;
  synced!: boolean;
  created_at!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'OfflineLegalDocument',
    properties: {
      _id: 'string',
      title: 'string',
      content: 'string',
      source: 'string',
      document_type: 'string',
      metadata: 'string', // JSON string
      synced: { type: 'bool', default: false },
      created_at: 'date',
    },
    primaryKey: '_id',
  };
}

class OfflineUserCase extends Realm.Object<OfflineUserCase> {
  _id!: string;
  user_id!: string;
  case_type!: string;
  title!: string;
  description!: string;
  status!: string;
  metadata!: string;
  synced!: boolean;
  created_at!: Date;
  updated_at!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'OfflineUserCase',
    properties: {
      _id: 'string',
      user_id: 'string',
      case_type: 'string',
      title: 'string',
      description: 'string',
      status: 'string',
      metadata: 'string', // JSON string
      synced: { type: 'bool', default: false },
      created_at: 'date',
      updated_at: 'date',
    },
    primaryKey: '_id',
  };
}

export class RealmService {
  private realm!: Realm;

  async initialize(): Promise<void> {
    const config: Realm.Configuration = {
      schema: [OfflineLegalDocument, OfflineUserCase],
      schemaVersion: 1,
    };
    this.realm = await Realm.open(config);
  }

  async syncWithMongoDB(): Promise<void> {
    const documents = await mongoService.getAllDocuments();
    // Implement sync logic between Realm and MongoDB Atlas
    const unsyncedCases = this.realm.objects('OfflineUserCase').filtered('synced == false');
    
    for (const case_ of unsyncedCases) {
      try {
        // Upload to MongoDB Atlas
        await mongoService.getCollection('user_cases').insertOne({
          ...case_,
          synced: true
        });
        
        // Mark as synced in Realm
        this.realm.write(() => {
          (case_ as any).synced = true;
        });
      } catch (error) {
        console.error('Failed to sync case:', error);
      }
    }
  }

  // Add methods for offline operations
  addOfflineDocument(document: Partial<OfflineLegalDocument>): void {
    this.realm.write(() => {
      this.realm.create('OfflineLegalDocument', {
        _id: document._id || new Realm.BSON.ObjectId().toString(),
        ...document,
        created_at: new Date(),
        synced: false
      });
    });
  }

  getOfflineDocuments(): Realm.Results<OfflineLegalDocument> {
    return this.realm.objects('OfflineLegalDocument');
  }
}

export const realmService = new RealmService();