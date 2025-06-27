import Realm from 'realm';
import { mongoService } from './mongodb';

// Define Realm schemas for offline storage
class OfflineLegalDocument extends Realm.Object {
  static schema = {
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

class OfflineUserCase extends Realm.Object {
  static schema = {
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
  private realm!: Realm; // Use definite assignment assertion

  async initialize(): Promise<void> {
    this.realm = await Realm.open({
      schema: [OfflineLegalDocument, OfflineUserCase],
      schemaVersion: 1,
    });
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
          metadata: JSON.parse(case_.metadata as string)
        });
        
        // Mark as synced
        this.realm.write(() => {
          (case_ as any).synced = true;
        });
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }
}