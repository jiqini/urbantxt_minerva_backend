import Realm from 'realm';
import { config } from '../utils/config';
import { LegalDocumentSchema } from '../types/mongodb-schemas';

// Define Realm schemas
class LegalDocument extends Realm.Object<LegalDocument> {
  _id!: string;
  title!: string;
  content!: string;
  source!: string;
  document_type!: string;
  metadata!: string;
  created_at!: Date;
  embedding?: number[];

  static schema: Realm.ObjectSchema = {
    name: 'LegalDocument',
    properties: {
      _id: 'string',
      title: 'string',
      content: 'string',
      source: 'string',
      document_type: 'string',
      metadata: 'string',
      created_at: 'date',
      embedding: 'double[]?',
    },
    primaryKey: '_id',
  };
}

export class DatabaseService {
  private realm?: Realm;
  private _isConnected: boolean = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    try {
      this.realm = await Realm.open({
        schema: [LegalDocument],
        schemaVersion: 1,
      });
      this._isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Realm:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this._isConnected = false;
    }
  }

  // Get all documents
  async getAllDocuments(): Promise<LegalDocument[]> {
    if (!this.realm) throw new Error('Database not connected');
    return Array.from(this.realm.objects<LegalDocument>('LegalDocument'));
  }

  // Simple text search (replace vector search)
  async searchDocuments(
    query: string,
    limit: number = 5
  ): Promise<LegalDocument[]> {
    if (!this.realm) throw new Error('Database not connected');
    
    const documents = this.realm.objects<LegalDocument>('LegalDocument')
      .filtered('title CONTAINS[c] $0 OR content CONTAINS[c] $0', query)
      .slice(0, limit);
    
    return Array.from(documents);
  }

  // Add document
  async addDocument(doc: Omit<LegalDocument, '_id'>): Promise<void> {
    if (!this.realm) throw new Error('Database not connected');
    
    this.realm.write(() => {
      this.realm!.create('LegalDocument', {
        ...doc,
        _id: new Date().getTime().toString(),
      });
    });
  }
}

export const databaseService = new DatabaseService();
// Add backward compatibility export
export const mongoService = databaseService;