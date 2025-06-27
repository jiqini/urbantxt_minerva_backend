import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentOrchestrator, AgentResponse } from '../services/AgentOrchestrator';

interface AIContextType {
  orchestrator: AgentOrchestrator | null;
  isInitialized: boolean;
  isLoading: boolean;
  processQuery: (query: string) => Promise<AgentResponse | null>;
  generateDocument: (type: string, details: any) => Promise<AgentResponse | null>;
  setDeadline: (deadline: any) => Promise<AgentResponse | null>;
  getScenarioAdvice: (scenario: string) => Promise<AgentResponse | null>;
  findResources: (location: string, type: string) => Promise<AgentResponse | null>;
  getEtiquetteAdvice: (situation: string) => Promise<AgentResponse | null>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        const aiOrchestrator = new AgentOrchestrator();
        await aiOrchestrator.initialize();
        setOrchestrator(aiOrchestrator);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, []);

  const processQuery = async (query: string): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      return await orchestrator.processQuery(query);
    } catch (error) {
      console.error('Error processing query:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocument = async (type: string, details: any): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      const agent = orchestrator['agents'].get('document');
      if (agent) {
        return await agent.execute(`Generate a ${type} document with these details: ${JSON.stringify(details)}`, {});
      }
      return null;
    } catch (error) {
      console.error('Error generating document:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setDeadline = async (deadline: any): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      const agent = orchestrator['agents'].get('deadline');
      if (agent) {
        return await agent.execute(`Set deadline: ${JSON.stringify(deadline)}`, {});
      }
      return null;
    } catch (error) {
      console.error('Error setting deadline:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioAdvice = async (scenario: string): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      const agent = orchestrator['agents'].get('coach');
      if (agent) {
        return await agent.execute(scenario, {});
      }
      return null;
    } catch (error) {
      console.error('Error getting scenario advice:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const findResources = async (location: string, type: string): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      const agent = orchestrator['agents'].get('resource');
      if (agent) {
        return await agent.execute(`Find ${type} resources in ${location}`, {});
      }
      return null;
    } catch (error) {
      console.error('Error finding resources:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEtiquetteAdvice = async (situation: string): Promise<AgentResponse | null> => {
    if (!orchestrator || !isInitialized) return null;
    
    try {
      setIsLoading(true);
      const agent = orchestrator['agents'].get('etiquette');
      if (agent) {
        return await agent.execute(situation, {});
      }
      return null;
    } catch (error) {
      console.error('Error getting etiquette advice:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AIContextType = {
    orchestrator,
    isInitialized,
    isLoading,
    processQuery,
    generateDocument,
    setDeadline,
    getScenarioAdvice,
    findResources,
    getEtiquetteAdvice,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}