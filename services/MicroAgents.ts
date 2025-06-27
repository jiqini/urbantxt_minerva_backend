import OpenAI from 'openai';
import { AgentResponse, LegalDocument, AgentAction } from './AgentOrchestrator';

export abstract class MicroAgent {
  protected openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  abstract execute(query: string, context: any): Promise<AgentResponse>;
}

export class DocumentTemplateAgent extends MicroAgent {
  async execute(query: string, context: any): Promise<AgentResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal document template agent for El Salvador. Generate CSJ-compliant legal documents based on user requirements.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    });

    return {
      content: response.choices[0].message.content || '',
      citations: context.legalContext || [],
      actions: [{
        type: 'create_document',
        payload: { template: 'legal_document', content: response.choices[0].message.content }
      }]
    };
  }
}

export class DeadlineAgent extends MicroAgent {
  async execute(query: string, context: any): Promise<AgentResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal deadline management agent for El Salvador legal system. Help users track and manage legal deadlines.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    });

    return {
      content: response.choices[0].message.content || '',
      citations: context.legalContext || [],
      actions: [{
        type: 'set_deadline',
        payload: { deadline: new Date(), description: query }
      }]
    };
  }
}

export class ScenarioCoachAgent extends MicroAgent {
  async execute(query: string, context: any): Promise<AgentResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal scenario coach for El Salvador. Provide role-play scenarios and coaching for legal situations.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.3,
    });

    return {
      content: response.choices[0].message.content || '',
      citations: context.legalContext || []
    };
  }
}

export class ResourceLocatorAgent extends MicroAgent {
  async execute(query: string, context: any): Promise<AgentResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal resource locator for El Salvador. Help users find relevant legal resources, contacts, and information.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    });

    return {
      content: response.choices[0].message.content || '',
      citations: context.legalContext || []
    };
  }
}

export class EtiquetteAgent extends MicroAgent {
  async execute(query: string, context: any): Promise<AgentResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal etiquette and procedure agent for El Salvador courts. Provide guidance on proper legal procedures and court etiquette.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    });

    return {
      content: response.choices[0].message.content || '',
      citations: context.legalContext || []
    };
  }
}