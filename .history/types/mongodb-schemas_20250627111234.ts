export interface LegalDocumentSchema {
  _id?: string;
  title: string;
  content: string;
  source: 'CSJ' | 'CENDOJ' | 'MANUAL' | 'TEMPLATE';
  document_type: 'statute' | 'procedure' | 'form' | 'precedent';
  embedding: number[];
  metadata: {
    articles?: string[];
    keywords?: string[];
    category?: string;
    jurisdiction?: string;
    lastUpdated?: Date;
  };
  created_at: Date;
}

export interface UserCaseSchema {
  _id?: string;
  user_id: string;
  case_type: 'civil' | 'family' | 'labor' | 'criminal' | 'administrative';
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  metadata: {
    parties?: string[];
    court?: string;
    case_number?: string;
    filing_date?: Date;
    deadlines?: Array<{
      type: string;
      date: Date;
      description: string;
      completed: boolean;
    }>;
  };
  created_at: Date;
  updated_at: Date;
}

export interface GeneratedDocumentSchema {
  _id?: string;
  case_id: string;
  template_type: string;
  content: {
    user_data: Record<string, any>;
    template_data: Record<string, any>;
    generated_text: string;
  };
  pdf_url?: string;
  status: 'draft' | 'final' | 'filed';
  created_at: Date;
}