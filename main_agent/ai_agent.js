/*
 * Main Agent - Handles conversational context and routes to various AI tools
 *
 * Author: Ji Qi Ni
 */

require('dotenv').config();
const { OpenAI } = require('openai');
const { getQueryResults } = require('../backend/utils/query_semantic_search');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

class LegalAgent {
    constructor() {
        this.conversationHistory = [];
        this.maxHistoryLength = 20; // Keep last 20 messages to manage token usage
    }

    // Add message to conversation history
    addMessage(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Trim history if it gets too long
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }

    // Get recent context for tool calls (last 2-3 exchanges)
    getRecentContext(turns = 2) {
        const recentMessages = this.conversationHistory.slice(-(turns * 2));
        return recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    }

    // Determine if query needs semantic search
    async needsSemanticSearch(userInput) {
        const systemPrompt = `You are a legal AI assistant for El Salvador law ONLY. Determine if the following user query should trigger a vector search through a legal document database.

Trigger vector search ONLY if the user is:
- Asking about specific El Salvador laws, rights, procedures, penalties, deadlines, or legal steps
- Requesting interpretation or application of El Salvador legal articles
- Asking for legal basis or what El Salvador law says
- Asking about El Salvador court processes

Do NOT trigger vector search if:
- The user is asking about cooking, movies, entertainment, other countries, general knowledge
- The user is making general conversation, asking for clarification, or saying thank you
- It's a casual or vague inquiry not requiring El Salvador legal document lookup

Respond ONLY with the word: true or false. No other explanation.

User Query: "${userInput}"
Recent Context: "${this.getRecentContext(1)}"
Answer:`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0,
                max_tokens: 70
            });


            const classification = response.choices[0].message.content.toLowerCase();
            return classification.includes('true') || classification.includes('yes') || classification.includes('search');
            
        } catch (err) {
            console.warn('Error determining search need:', err.message);
            return true; // Default to searching if uncertain
        }
    }

    // Main conversation handler
    async handleQuery(userInput) {
        try {
            // Add user message to history
            this.addMessage('user', userInput);
 
            let legalContext = '';
            let searchResults = [];

            // Check if we need to search legal documents
            const needsSearch = await this.needsSemanticSearch(userInput);
            
            if (needsSearch) {
                // For semantic search, use current query + recent context if helpful
                const contextualQuery = this.conversationHistory.length > 1 ? 
                    `${this.getRecentContext(1)}\nuser: ${userInput}` : userInput;
                
                console.log('🔍 Searching legal documents...');
                searchResults = await getQueryResults(contextualQuery, 5);
                
                // 1. Inject article numbers before LLM sees the chunks
                if (searchResults.length > 0) {
                    legalContext = '\n\nRelevant Legal Information:\n' + 
                        searchResults.map((result, i) => {
                            const articlePrefix = result.article ? `Artículo ${result.article}\n` : '';
                            return `Source ${i + 1}:\n${articlePrefix}${result.text}`;
                        }).join('\n\n');
                    
                    console.log('📚 Legal context being sent to GPT:', legalContext.substring(0, 300) + '...');
                }
            }

            // Generate response with full conversation context
            const systemMessage = {
                role: 'system',
                role: 'system',
                content: `You are a legal assistant specialized in El Salvador law. 
                
                CRITICAL INSTRUCTIONS:
                - ONLY answer questions related to El Salvador law, legal procedures, court processes, and legal rights in El Salvador
                - If legal documents were found, base your response PRIMARILY on the provided legal context
                - When referencing legal articles:
                  * ONLY cite article numbers that appear in the legal context below
                  * Do NOT invent, guess, or reference articles not provided in the context
                  * If no specific article is found, refer to "the legal provisions" or "El Salvador law"
                  * When you do cite an article, use the exact format provided in the context
                - Quote relevant text directly from the sources when applicable
                - Be conversational and remember previous parts of this chat
                - If you don't have specific legal information, be honest about limitations
                - Always recommend consulting with a licensed attorney for specific legal advice
                
                If the user asks about non-legal topics, respond with:
                "I'm specifically designed to assist with El Salvador legal matters only. Please ask me about El Salvador laws, court procedures, legal rights, or legal processes, and I'll be happy to help you."
                
                ${legalContext ? `Legal context found: ${legalContext}` : 'No specific legal documents found for this query.'}`
            };

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    systemMessage,
                    ...this.conversationHistory
                ],
                temperature: 0.3,
                max_tokens: 800
            });

            let assistantResponse = response.choices[0].message.content;
            
            // ⚠️ HALLUCINATION DETECTION: Check for invented articles
            const mentionedArticles = assistantResponse.match(/Art\.?\s?\d+|Article\s+\d+/gi) || [];
            const validArticles = searchResults.map(c => c.article).filter(Boolean);
            
            const hallucinatedArticles = [];
            mentionedArticles.forEach(articleMention => {
                const articleNumber = articleMention.match(/\d+/)[0];
                const isValid = validArticles.some(validArt => 
                    validArt.includes(articleNumber) || validArt.includes(`Art. ${articleNumber}`)
                );
                
                if (!isValid) {
                    hallucinatedArticles.push(articleMention);
                    console.warn(`⚠️ Possible hallucination: ${articleMention} - not found in search results`);
                }
            });
            
            // Optionally add warning to response
            if (hallucinatedArticles.length > 0) {
                console.warn(`⚠️ Detected ${hallucinatedArticles.length} potentially hallucinated article(s): ${hallucinatedArticles.join(', ')}`);
                
                // You could even modify the response to add a disclaimer:
                // assistantResponse += `\n\n⚠️ Note: Some article references may need verification as they weren't found in the retrieved legal documents.`;
            }
            
            // 2. After LLM response: Check for usage and detect used chunks
            let usedChunks = [];
            let referencedArticles = [];
            
            if (searchResults.length > 0) {
                usedChunks = searchResults.filter(chunk => {
                    // Check if article number was mentioned
                    const articleMentioned = chunk.article && 
                        (assistantResponse.includes(chunk.article) || 
                        assistantResponse.includes(`Artículo ${chunk.article}`) ||
                        assistantResponse.includes(`Article ${chunk.article}`));
                    
                    // Check if source number was mentioned (Source 1, Source 2, etc.)
                    const sourceIndex = searchResults.indexOf(chunk) + 1;
                    const sourceMentioned = assistantResponse.includes(`Source ${sourceIndex}`) ||
                                        assistantResponse.includes(`[Source ${sourceIndex}]`);
                    
                    // Enhanced text usage detection - look for 3+ consecutive words
                    const chunkWords = chunk.text.toLowerCase().split(/\s+/);
                    const responseText = assistantResponse.toLowerCase();
                    let significantTextUsed = false;
                    
                    // Check for meaningful phrases (4+ words, 20+ characters)
                    for (let i = 0; i <= chunkWords.length - 4; i++) {
                        const phrase = chunkWords.slice(i, i + 4).join(' ');
                        if (phrase.length > 20 && responseText.includes(phrase)) {
                            significantTextUsed = true;
                            break;
                        }
                    }
                    
                    return articleMentioned || sourceMentioned || significantTextUsed;
                });
                
                console.log('📋 Used chunks:', usedChunks.length);
                if (usedChunks.length > 0) {
                    console.log('📋 Used chunk details:', usedChunks.map(c => ({
                        article: c.article,
                        heading: c.heading,
                        textPreview: c.text.substring(0, 100) + '...'
                    })));
                }

                // Enhanced post-processing with better pattern matching
                usedChunks.forEach((chunk) => {
                    const sourceIndex = searchResults.indexOf(chunk) + 1;
                    const sourcePatterns = [
                        new RegExp(`\\[?Source ${sourceIndex}\\]?`, 'g'),
                        new RegExp(`\\[?source ${sourceIndex}\\]?`, 'g'),
                        new RegExp(`Source ${sourceIndex}`, 'g')
                    ];
                    
                    sourcePatterns.forEach(pattern => {
                        if (chunk.article) {
                            // Replace with article number
                            assistantResponse = assistantResponse.replace(pattern, `Article ${chunk.article}`);
                            if (!referencedArticles.includes(chunk.article)) {
                                referencedArticles.push(chunk.article);
                            }
                        } else if (chunk.heading) {
                            // Replace with heading
                            assistantResponse = assistantResponse.replace(pattern, `"${chunk.heading}"`);
                        } else {
                            // Fallback to generic legal text reference
                            assistantResponse = assistantResponse.replace(pattern, 'the legal provisions');
                        }
                    });
                });
                
                console.log('📌 Referenced articles:', referencedArticles);
            }

            // 3. Append "Referenced Articles" if any were actually used
            if (referencedArticles.length > 0) {
                assistantResponse += `\n\n📌 Referenced article${referencedArticles.length > 1 ? 's' : ''}: ${referencedArticles.join(', ')}`;
            }
            
            // Add assistant response to history
            this.addMessage('assistant', assistantResponse);

            return {
                response: assistantResponse,
                searchResults: searchResults,
                usedSearch: needsSearch,
                usedChunks: usedChunks,
                referencedArticles: referencedArticles,
                hallucinatedArticles: hallucinatedArticles || []
            };

        } catch (error) {
            console.error('Error in handleQuery:', error);
            return {
                response: 'I apologize, but I encountered an error. Please try rephrasing your question.',
                searchResults: [],
                usedSearch: false,
                usedChunks: [],
                referencedArticles: [],
                hallucinatedArticles: []
            };
        }
    }

    // Clear conversation history (for new chat sessions)
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get conversation history (for debugging or persistence)
    getHistory() {
        return this.conversationHistory;
    }

    // Load conversation history (from database or session)
    loadHistory(history) {
        this.conversationHistory = history || [];
    }
}

module.exports = { LegalAgent };