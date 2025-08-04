/*
 * This file tests query_semantice_search.js semantic search on various userQuery inputs. 
 */

const { getQueryResults } =  require('./query_semantic_search.js');

(async () => {
  //const userQuery = "What are the legal requirements to request the modification of child custody in El Salvador, and how does the court determine the best interest of the child?";
  //const userQuery = "What are the legal requirements and procedural steps for filing a criminal complaint for theft (hurto) in El Salvador?"
  const userQuery = "I recently got sued for stealing, but I never stole anything. What should I do?"
  const results = await getQueryResults(userQuery);

  console.log('🔍 Top Results:\n');
  results.forEach((doc, i) => {
    console.log(`Result #${i + 1}`);
    console.log('Text:', doc.text);
    console.log('Score:', doc.score.toFixed(4));
    console.log('Source URL:', doc.url);
    console.log('---\n');
  });
})();