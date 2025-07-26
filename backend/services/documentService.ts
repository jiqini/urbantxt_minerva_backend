import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface DocumentData {
  type: string;
  title: string;
  content: string;
  metadata: {
    createdAt: Date;
    author: string;
    caseNumber?: string;
  };
}

class DocumentService {
  async generatePDF(documentData: DocumentData): Promise<string> {
    const htmlContent = this.generateHTML(documentData);
    
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      return uri;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Error generando PDF');
    }
  }

  async sharePDF(uri: string, filename: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, create download link
        const link = document.createElement('a');
        link.href = uri;
        link.download = filename;
        link.click();
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir documento',
        });
      }
    } catch (error) {
      console.error('Sharing Error:', error);
      throw new Error('Error compartiendo documento');
    }
  }

  private generateHTML(documentData: DocumentData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${documentData.title}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              margin: 2cm;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .title {
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14pt;
              margin-bottom: 5px;
            }
            .content {
              text-align: justify;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 10pt;
              color: #666;
            }
            .signature-line {
              margin-top: 50px;
              text-align: center;
            }
            .signature-line::before {
              content: '';
              display: inline-block;
              width: 200px;
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${documentData.title}</div>
            <div class="subtitle">República de El Salvador</div>
            ${documentData.metadata.caseNumber ? `<div>Expediente: ${documentData.metadata.caseNumber}</div>` : ''}
          </div>
          
          <div class="content">
            ${documentData.content.replace(/\n/g, '<br>')}
          </div>
          
          <div class="signature-line">
            <div>Firma del Solicitante</div>
          </div>
          
          <div class="footer">
            <p>Documento generado por Minerva - Asistente Legal</p>
            <p>Fecha de generación: ${documentData.metadata.createdAt.toLocaleDateString('es-SV')}</p>
            <p><em>Este documento es solo informativo y no constituye asesoría legal profesional</em></p>
          </div>
        </body>
      </html>
    `;
  }

  getDocumentTemplates() {
    return [
      {
        id: 'demanda',
        title: 'Demanda',
        description: 'Documento para iniciar un proceso judicial',
        color: '#ef4444',
        fields: [
          { name: 'plaintiff', label: 'Datos del demandante', type: 'text', required: true },
          { name: 'defendant', label: 'Datos del demandado', type: 'text', required: true },
          { name: 'caseType', label: 'Tipo de caso', type: 'select', options: ['Alimentos', 'Divorcio', 'Laboral', 'Civil'] },
          { name: 'facts', label: 'Hechos', type: 'textarea', required: true },
          { name: 'amount', label: 'Monto reclamado', type: 'number' }
        ]
      },
      {
        id: 'contestacion',
        title: 'Contestación',
        description: 'Respuesta a una demanda interpuesta',
        color: '#3b82f6',
        fields: [
          { name: 'defendant', label: 'Datos del demandado', type: 'text', required: true },
          { name: 'caseNumber', label: 'Número de expediente', type: 'text', required: true },
          { name: 'exceptions', label: 'Excepciones', type: 'textarea' },
          { name: 'defenses', label: 'Defensas', type: 'textarea', required: true },
          { name: 'counterClaim', label: 'Reconvención', type: 'textarea' }
        ]
      },
      {
        id: 'apelacion',
        title: 'Apelación',
        description: 'Recurso contra una resolución judicial',
        color: '#8b5cf6',
        fields: [
          { name: 'appellant', label: 'Datos del apelante', type: 'text', required: true },
          { name: 'resolution', label: 'Resolución apelada', type: 'text', required: true },
          { name: 'grievances', label: 'Agravios', type: 'textarea', required: true },
          { name: 'legalBasis', label: 'Fundamentos de derecho', type: 'textarea', required: true }
        ]
      }
    ];
  }
}

export const documentService = new DocumentService();