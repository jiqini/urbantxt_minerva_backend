export const config = {
  mongodb: {
    uri: process.env.EXPO_PUBLIC_MONGODB_URI!,
    dbName: 'minerva_legal',
    collections: {
      legalDocuments: 'legal_documents',
      userCases: 'user_cases',
      generatedDocuments: 'generated_documents',
      userSessions: 'user_sessions'
    }
  },
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  },
  rag: {
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.3,
    vectorDimensions: 1536,
  },
};