/*
 * This file tests query_semantice_search.js semantic search on various userQuery inputs. 
 */


const { getQueryResults, getTagsLLM } = require('./query_semantic_search.js');


(async () => {
  //const userQuery = "What are the legal requirements to request the modification of child custody in El Salvador, and how does the court determine the best interest of the child?";
  //const userQuery = "What are the legal requirements and procedural steps for filing a criminal complaint for theft (hurto) in El Salvador?"
  const userQuery = "I recently got sued for stealing at a market, but I never stole anything. What should I do?"
  //const userQuery = "I recently got my court decision back. But I want to argue with the court, so I can see my kids 3 days of the week. What can I do? What facts can I bring up?";

  // Print LLM tags for the query
  const tags = await getTagsLLM(userQuery);
  console.log('🔖 LLM Tags for Query:', tags);

  const results = await getQueryResults(userQuery);

  console.log('🔍 Top Results:\n');
  results.forEach((doc, i) => {
    console.log(`Result #${i + 1}`);
    console.log('Text:', doc.text);
    console.log('Score:', doc.score.toFixed(4));
    console.log('Tags:', doc.tags);
    console.log('Source:', doc.source);
    console.log('Heading:', doc.heading);
    console.log('Article:', doc.article);
    console.log('---\n');
  });
})();