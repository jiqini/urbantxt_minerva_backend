/*
 * Test file for the main AI agent
 * Usage: node test_agent.js
 * 
 * Author: Ji Qi Ni
 */

const { LegalAgent } = require('../main_agent/ai_agent');
const readline = require('readline');

// readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const agent = new LegalAgent();

console.log('El Salvador Legal AI Agent - Test Mode');
console.log('Type your questions and press Enter. Option: Type "exit" to quit, "clear" to reset the conversations.\n');

async function handleUserInput() {
    rl.question('You: ', async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            console.log('Thank you for choosing Minerva Legal Assistant. Goodbye!');
            rl.close();
            return;
        }

        if (userInput.toLowerCase() === 'clear') {
            agent.clearHistory();
            console.log('Conversation history cleared\n');
            handleUserInput();
            return;
        }

        if (userInput.toLowerCase() === 'history') {
            console.log('Conversation History:');
            console.log(JSON.stringify(agent.getHistory(), null, 2));
            console.log('');
            handleUserInput();
            return;
        }

        if (!userInput.trim()) {
            handleUserInput();
            return;
        }

        try {
            const result = await agent.handleQuery(userInput);
            console.log('Minerva Assistant:', result.response);
            
            if (result.usedSearch) {
                console.log('\n Using vector search');
                if (result.searchResults && result.searchResults.length > 0) {
                    console.log(`Found ${result.searchResults.length} relevant legal documents:`);
                    result.searchResults.forEach((doc, i) => {
                        console.log(`   ${i + 1}. ${doc.heading || doc.article || 'Legal Text'} (Score: ${doc.score.toFixed(3)})`);
                    });
                } else {
                    console.log('No legal documents found');
                }
                
                // ✅ ADD THIS: Show referenced articles
                if (result.referencedArticles && result.referencedArticles.length > 0) {
                    console.log(`\n📌 Articles referenced: ${result.referencedArticles.join(', ')}`);
                }
                
            } else {
                console.log('\n💬 Conversational response (no document search)');
            }
            
            console.log('\n' + '-'.repeat(60) + '\n');          
        } catch (error) {
            console.error('Error:', error.message);
            console.log('\n' + '-'.repeat(60) + '\n');
        }

        handleUserInput();
    });
}

// Start the conversation
handleUserInput();

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n Goodbye!');
    rl.close();
    process.exit();
});