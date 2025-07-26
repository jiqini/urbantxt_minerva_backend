import OpenAI from 'openai';
// Change this line:
// import { mongoService } from './mongodb';
// To:
import { databaseService } from './mongodb';
import { config } from '../utils/config';
import {
  MicroAgent,
  DocumentTemplateAgent,
  DeadlineAgent,
  ScenarioCoachAgent,
  ResourceLocatorAgent,
  EtiquetteAgent
} from './MicroAgents';

export interface AgentResponse {
  content: string;
  citations?: LegalDocument[];
  actions?: AgentAction[];
}

export interface LegalDocument {
  _id: string;
  title: string;
  content: string;
  source: string;
  document_type: string;
  score?: number;
}

export interface AgentAction {
  type: 'create_document' | 'set_deadline' | 'schedule_reminder';
  payload: any;
}

export class AgentOrchestrator {
  private openai: OpenAI;
  private agents: Map<string, MicroAgent>;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    this.agents = new Map([
      ['document', new DocumentTemplateAgent(this.openai)],
      ['deadline', new DeadlineAgent(this.openai)],
      ['coach', new ScenarioCoachAgent(this.openai)],
      ['resource', new ResourceLocatorAgent(this.openai)],
      ['etiquette', new EtiquetteAgent(this.openai)],
    ]);
  }

  async initialize(): Promise<void> {
    await databaseService.connect(); // Changed from mongoService
  }

  async processQuery(query: string, context?: any): Promise<AgentResponse> {
    // Determine intent and route to appropriate agent(s)
    const intent = await this.classifyIntent(query);
    
    // Get relevant legal context via MongoDB Vector Search
    const legalContext = await this.retrieveLegalContext(query);
    
    // Execute agent(s)
    const agent = this.agents.get(intent.primaryAgent);
    if (!agent) {
      throw new Error(`Agent not found: ${intent.primaryAgent}`);
    }
    
    return await agent.execute(query, { ...context, legalContext });
  }

  private async classifyIntent(query: string) {
    const response = await this.openai.chat.completions.create({
      model: config.rag.chatModel,
      messages: [
        {
          role: 'system',
          content: `Classify the user's legal query intent for El Salvador legal system. Return JSON with:
          {
            "primaryAgent": "document|deadline|coach|resource|etiquette",
            "confidence": 0.0-1.0,
            "reasoning": "brief explanation",
            "caseType": "civil|family|labor|criminal|administrative"
          }`
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    });
    
    return JSON.parse(response.choices[0].message.content!);
  }

  private async retrieveLegalContext(query: string): Promise<LegalDocument[]> {
    // Generate embedding for query
    const embedding = await this.openai.embeddings.create({
      model: config.rag.embeddingModel,
      input: query,
    });

    // Search similar legal documents using MongoDB Vector Search
    // Replace vectorSearch with searchDocuments
    // Note: This will perform a text-based search, not a vector-based semantic search.
    // The original query string is used for the search.
    const results = await databaseService.searchDocuments(
      query, // Use the original query string
      5
    );

    return results as LegalDocument[];
  }
}