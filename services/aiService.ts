interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  confidence: number;
  citations?: string[];
  suggestedActions?: string[];
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Eres Minerva, un asistente legal especializado en las leyes de El Salvador. 
              Proporciona información educativa precisa sobre procedimientos legales, pero siempre 
              recuerda que no brindas asesoría legal profesional. Cita las leyes relevantes cuando 
              sea posible y sugiere acciones específicas que el usuario puede tomar.`
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

      return {
        message,
        confidence: 0.85,
        citations: this.extractCitations(message),
        suggestedActions: this.extractSuggestedActions(message),
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        message: 'Lo siento, hay un problema con el servicio. Por favor intenta más tarde.',
        confidence: 0,
      };
    }
  }

  private extractCitations(text: string): string[] {
    const citationRegex = /(Artículo \d+|Código \w+|Ley \w+)/gi;
    return text.match(citationRegex) || [];
  }

  private extractSuggestedActions(text: string): string[] {
    const actionRegex = /(?:debes|puedes|recomiendo|sugiero)\s+([^.]+)/gi;
    const matches = [];
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return matches.slice(0, 3); // Limit to 3 suggestions
  }

  async generateDocument(templateType: string, userData: any): Promise<string> {
    const prompt = this.getDocumentPrompt(templateType, userData);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en documentos legales de El Salvador. Genera documentos completos y formalmente correctos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Error generando documento';
    } catch (error) {
      console.error('Document Generation Error:', error);
      return 'Error generando documento. Por favor intenta más tarde.';
    }
  }

  private getDocumentPrompt(templateType: string, userData: any): string {
    switch (templateType) {
      case 'demanda':
        return `Genera una demanda legal para El Salvador con los siguientes datos:
        Demandante: ${userData.plaintiff || '[NOMBRE DEL DEMANDANTE]'}
        Demandado: ${userData.defendant || '[NOMBRE DEL DEMANDADO]'}
        Tipo de caso: ${userData.caseType || '[TIPO DE CASO]'}
        Hechos: ${userData.facts || '[DESCRIPCIÓN DE LOS HECHOS]'}
        
        Incluye todas las secciones requeridas: encabezado, hechos, fundamentos de derecho, y petitorio.`;
        
      case 'contestacion':
        return `Genera una contestación de demanda para El Salvador con los siguientes datos:
        Demandado: ${userData.defendant || '[NOMBRE DEL DEMANDADO]'}
        Caso: ${userData.caseNumber || '[NÚMERO DE CASO]'}
        Excepciones: ${userData.exceptions || '[EXCEPCIONES A INTERPONER]'}
        Defensas: ${userData.defenses || '[DEFENSAS DEL DEMANDADO]'}
        
        Incluye negativa de hechos, excepciones, y defensas apropiadas.`;
        
      case 'apelacion':
        return `Genera un recurso de apelación para El Salvador con los siguientes datos:
        Apelante: ${userData.appellant || '[NOMBRE DEL APELANTE]'}
        Resolución apelada: ${userData.resolution || '[RESOLUCIÓN APELADA]'}
        Agravios: ${userData.grievances || '[AGRAVIOS]'}
        
        Incluye fundamentos legales y petitorio específico.`;
        
      default:
        return 'Genera un documento legal básico para El Salvador.';
    }
  }

  async calculateDeadline(caseType: string, startDate: Date): Promise<{ deadline: Date; description: string }> {
    const deadlineRules: Record<string, { days: number; description: string }> = {
      'contestacion': { days: 3, description: 'Plazo para contestar demanda (3 días hábiles)' },
      'apelacion': { days: 3, description: 'Plazo para apelar (3 días hábiles)' },
      'casacion': { days: 15, description: 'Plazo para casación (15 días hábiles)' },
      'amparo': { days: 3, description: 'Plazo para amparo (3 días hábiles)' },
      'revision': { days: 8, description: 'Plazo para revisión (8 días hábiles)' },
    };

    const rule = deadlineRules[caseType.toLowerCase()] || { days: 5, description: 'Plazo general (5 días hábiles)' };
    
    // Calculate business days
    const deadline = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < rule.days) {
      deadline.setDate(deadline.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (deadline.getDay() !== 0 && deadline.getDay() !== 6) {
        daysAdded++;
      }
    }

    return {
      deadline,
      description: rule.description
    };
  }
}

export const aiService = new AIService();