const express = require('express');
const { LegalAgent } = require('../main_agent/ai_agent');

const router = express.Router();
const userAgents = new Map();

router.post('/chat', async (req, res) => {
  try {
    const { messages, userId = 'default' } = req.body;
    
    console.log('Chat request received');
    console.log('User ID:', userId);
    console.log('Message:', messages[messages.length - 1].content);
    
    if (!userAgents.has(userId)) {
      userAgents.set(userId, new LegalAgent());
      console.log('Created new agent for user:', userId);
    }
    
    const agent = userAgents.get(userId);
    const userMessage = messages[messages.length - 1].content;
    
    const result = await agent.handleQuery(userMessage);
    console.log('Agent response by itself:', result);
    
    console.log('AI response generated');
    console.log('Used search:', result.usedSearch);
    console.log('Search results:', result.searchResults?.length || 0);
    console.log('Referenced articles:', result.referencedArticles);
    
    res.json({
      message: result.response,
      usedSearch: result.usedSearch,
      searchResults: result.searchResults,
      referencedArticles: result.referencedArticles,
      metadata: {
        usedChunks: result.usedChunks?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Lo siento, hubo un problema. Por favor intenta de nuevo.',
      error: 'Internal server error' 
    });
  }
});

module.exports = router;