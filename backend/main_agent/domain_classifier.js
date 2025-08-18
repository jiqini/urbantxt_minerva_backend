/*
 * This file will classify the user query based on family, abuse, criminal, and other.
 * After classification, it will run the specialized script based on the classification.
 * 
 * Author: Ji Qi Ni
 */

const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

const Tags = {
    family: [
    'custody', 'custodia', 'divorce', 'divorcio', 'children', 'hijos', 'niños',
    'visitation', 'visitación', 'spouse', 'esposo', 'esposa', 'matrimonio',
    'marriage', 'child support', 'pensión alimenticia', 'alimentos'
  ],
  abuse: [
    'abuse', 'abuso', 'violence', 'violencia', 'hits me', 'me pega', 
    'threatens', 'amenaza', 'domestic violence', 'violencia doméstica',
    'maltrato', 'golpes', 'miedo', 'hurt', 'lastimar'
  ],
  criminal: [
    'charges', 'cargos', 'crime', 'crimen', 'delito', 'arrest', 'arresto',
    'police', 'policía', 'jail', 'cárcel', 'prison', 'prisión', 'penal',
    'theft', 'robo', 'assault', 'agresión', 'murder', 'asesinato'
  ]
};

// classify with tags
  function classifyWithTags(query) {
    const lowerQuery = query.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(Tags)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {  // Fixed: includes not inclues
        console.log(`Domain classified as: ${domain} (keyword match)`);
        return domain;
      }
    }
    return null;  // meaning no tags found, default script
}

// LLM-based classification 
async function classifyWithLLM(query) {
    const classificationPrompt = `You are a legal domain classifier for El Salvador law. 
  
Choose the BEST legal domain for this user query. Respond with ONLY the domain name.

Available domains:
- family: divorce, custody, child support, marriage issues
- abuse: domestic violence, threats, physical harm
- criminal: crimes, arrests, charges, legal violations
- default: general legal questions

User query: "${query}"

Domain:`;
    try {
        const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: classificationPrompt }],
        max_tokens: 10,
        temperature: 0
    });
    
    const domain = response.choices[0].message.content.trim().toLowerCase();
    console.log(`LLM classification: ${domain}`);
    
    // Validate LLM response
    const validDomains = ['family', 'abuse', 'criminal', 'default'];
    return validDomains.includes(domain) ? domain : 'default';
    
    } catch (error) {
        console.warn('LLM classification failed, using default');
        return 'default';   
    }
}

// Load the specfic prompt
async function loadPrompt(domain) {
  try {
    const filePath = path.join(__dirname, 'prompts', `${domain}.txt`);
    const prompt = await fs.readFile(filePath, 'utf8');
    console.log(`Loaded prompt: ${domain}.txt`);
    return prompt;
  } catch (error) {
    console.warn(`Failed to load ${domain}.txt, falling back to default`);
    const defaultPath = path.join(__dirname, 'prompts', 'default.txt');
    return await fs.readFile(defaultPath, 'utf8');
  }
}

// MAIN EXPORTED FUNCTION
async function getSystemPromptForQuery(query) {
  // Try keyword classification first
  let domain = classifyWithTags(query);
  
  // Fall back to LLM if no keyword match
  if (!domain) {
    domain = await classifyWithLLM(query);
  }
  
  // Load and return the appropriate prompt
  return await loadPrompt(domain);
}

module.exports = { getSystemPromptForQuery, classifyWithTags };