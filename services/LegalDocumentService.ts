import { databaseService } from './mongodb';
import { OpenAI } from 'openai';
import { config } from '../utils/config';
import { LegalDocumentSchema } from '../types/mongodb-schemas';

export class LegalDocumentService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey });
  }

  async populateDatabase(): Promise<void> {
    await databaseService.connect();
    
    const legalDocuments = [
      {
        title: 'Código Civil - Artículo 1309 - Fuentes de las Obligaciones',
        content: 'Las obligaciones nacen, ya del concurso real de las voluntades de dos o más personas, como en los contratos o convenciones; ya de un hecho voluntario de la persona que se obliga, como en la aceptación de una herencia o legado y en todos los cuasicontratos; ya a consecuencia de un hecho que ha inferido injuria o daño a otra persona, como en los delitos y cuasidelitos; ya por disposición de la ley, como entre los padres y los hijos sujetos a patria potestad.',
        source: 'CSJ',
        document_type: 'statute',
        metadata: JSON.stringify({
          articles: ['1309'],
          keywords: ['obligaciones', 'contratos', 'responsabilidad civil'],
          category: 'derecho civil',
          jurisdiction: 'El Salvador'
        }),
        created_at: new Date()
      },
      {
        title: 'Procedimiento de Demanda de Alimentos - Código de Familia',
        content: 'Para interponer una demanda de alimentos se debe presentar ante el Juzgado de Familia correspondiente al domicilio del demandado o del demandante. La demanda debe contener: 1) Identificación completa de las partes, 2) Los hechos en que se funda la pretensión, 3) La cuantía de la pensión solicitada, 4) Las pruebas que se pretenden hacer valer.',
        source: 'CENDOJ',
        document_type: 'procedure',
        metadata: JSON.stringify({
          keywords: ['alimentos', 'familia', 'demanda', 'procedimiento'],
          category: 'derecho de familia',
          jurisdiction: 'El Salvador'
        }),
        created_at: new Date()
      },
      {
        title: 'Plazos Procesales - Código Procesal Civil',
        content: 'Los plazos procesales en materia civil son: Para contestar demanda: 3 días hábiles. Para interponer apelación: 3 días hábiles. Para presentar alegatos: 3 días hábiles. Para evacuar pruebas: 10 días hábiles. Todos los plazos se cuentan en días hábiles, excluyendo sábados, domingos y días feriados.',
        source: 'CSJ',
        document_type: 'procedure',
        metadata: JSON.stringify({
          keywords: ['plazos', 'procedimiento civil', 'términos'],
          category: 'derecho procesal',
          jurisdiction: 'El Salvador'
        }),
        created_at: new Date()
      },
    ];

    for (const doc of legalDocuments) {
      await databaseService.addDocument(doc as any);
    }
  }

  async getLegalDocuments(): Promise<any[]> {
    return await databaseService.getAllDocuments();
  }

  async searchDocuments(query: string, filters?: {
    document_type?: string;
    source?: string;
  }): Promise<any[]> {
    // Use the simple text search instead of vector search
    return await databaseService.searchDocuments(query, 5);
  }
}