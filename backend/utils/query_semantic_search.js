/*
 * This file takes in a user query, generates its embedding using OpenAI, and searches a MongoDB collection
 * for the most semantically similar chunks. Each chunk is a flat document with { text, embedding }.
 */

const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'tagged_db';
const COLLECTION_NAME = 'tag';

// Tag list for LLM tagging
const Tags = [
    "civil procedure", "civil code", "lawsuit process", "legal procedure", "appeals", "evidence rules",
    "trial process", "commercial law", "judicial hearings", "procedural law", "jurisdiction", "deadlines",
    "notifications", "motions", "remedies", "civil court", "litigation", "constitution", "legislative power", "executive power", "judicial power", "state organization",
    "president of the republic", "human rights", "constitutional rights", "due process", "presumption of innocence",
    "freedom of expression", "freedom of religion", "right to privacy", "habeas corpus", "nationality", "citizenship",
    "electoral process", "political parties", "public officials", "family rights", "children's rights", "elderly rights",
    "social security", "public health", "education rights", "public finance", "national budget", "tax system",
    "natural resources", "flag and symbols", "language", "official religion", "national holidays", "child custody", "shared custody", "visitation rights", "divorce", "contested divorce", "child support", "spousal support", 
    "parental authority", "adoption", "domestic violence", "protection order", "property separation", "paternity", "alimony",
    "lawsuit filing", "civil trial", "evidence submission", "appeals process", "court deadlines", "judicial decision", 
      "legal representation", "jurisdiction", "court notification", "procedural hearing", "default judgment", "court documentation",
      "domestic abuse", "child abuse", "restraining order", "criminal complaint", "protective measures",
      "request custody", "modify custody", "enforce visitation", "file for divorce", "request protection order", "appeal ruling", 
      "petition for adoption", "challenge custody", "request spousal support",
      "family law el salvador", "civil procedure el salvador", "court process", "el salvador family court", "legal process el salvador",
      "procedural code", "tax amnesty", "fiscal forgiveness", "debt regularization", "tax compliance", "tax obligations",
        "customs penalties", "social security debt", "ISSS", "Dirección General de Impuestos Internos",
        "Dirección General de Aduanas", "tributary law", "transitional tax law", "tax relief El Salvador",
        "government debt programs", "taxpayer benefits", "payment plans", "late tax payments",
        "legal deadlines", "reduced interest and penalties", "victim protection", "gender violence", "domestic violence", "protective measures", "sexual violence",
          "judicial protection", "victim rights", "psychosocial support", "legal assistance", "restraining order",
          "preventative measures", "reparations", "violence against women", "violence against children",
          "court proceedings", "law enforcement", "criminal justice process", "human rights", "due process", "consumer protection", "consumer rights", "product warranties", "false advertising", "deceptive practices",
            "inspections", "complaints and claims", "mediation", "consumer agency", "sanctions and fines",
            "administrative procedure", "consumer dispute resolution", "Defensoría del Consumidor", "service contracts",
            "retail regulations", "enforcement powers", "divorce", "custody", "shared custody", "visitation rights", "parental authority", "parental responsibility", "alimony", 
                "child support", "marriage annulment", "adoption", "joint adoption", "individual adoption", "domestic violence", "protective measures", 
                "property division", "family mediation", "minor protection", "emancipation", "family court procedure", "father’s rights", 
                "mother’s rights", "cohabitation", "separation", "civil union", "paternity", "maternity", "guardianship", "legal representative", 
                "child removal", "suspension of rights", "modification of measures", "family residence", "child travel", "child abduction", 
                "custody transfer", "special tutor", "child education", "child housing", "spousal support", "family registry", "name change"
];

// Tag the query using OpenAI LLM
async function getTagsLLM(text) {
    const prompt = `You are a legal expert specializing in family and civil law in El Salvador.

Your task is to classify the following legal or civil text by selecting only the relevant tags from this fixed list:
${JSON.stringify(Tags)}

Strict rules:
- Use only the tags from the list above. Do NOT invent new tags, use synonyms, or modify existing tags.
- Do NOT include vague or generic terms like "law", "article", or "legal".
- Only include tags that are clearly and specifically relevant to the content. Be concise and precise.

Legal text:
"""
${text}
"""

Return your answer as a valid JSON array of lowercase strings. Example:
["divorce", "visitation rights", "parental authority"]
`.trim();
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a legal expert for El Salvador.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.0,
                max_tokens: 300,
            });
            const content = response.choices[0].message.content;
            const match = content.match(/\[.*\]/s);
            if (!match) throw new Error('No JSON array found in LLM response');
            let tags = JSON.parse(match[0]);
            tags = Array.from(new Set(tags.map(t => t.toLowerCase())));
            tags = tags.filter(t => Tags.includes(t));
            return tags;
        } catch (err) {
            console.warn(`[Tagging] OpenAI LLM failed (attempt ${attempt + 1}):`, err.message);
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        }
    }
    return [];
}

// Function to get the embedding for a query string
async function getEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

/*
 * This function takes a user query, generates its embedding, and uses MongoDB Atlas $vectorSearch to find the 
 * top K most similar chunks. Each chunk is a flat document with { text, embedding }.
 */

// Main query function: LLM tag, filter by tag, then vector search
async function getQueryResults(query, topK = 5) {
    const client = new MongoClient(MONGO_URL);
    try {
        // 1. Tag the query
        const queryTags = await getTagsLLM(query);
        if (!queryTags.length) {
            throw new Error('No tags found for query.');
        }

        // 2. Find candidate chunks with at least one overlapping tag
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        let candidateChunks = await collection.find({ tags: { $in: queryTags } }).toArray();
        // Filter out empty or whitespace-only text
        candidateChunks = candidateChunks.filter(chunk => chunk.text && chunk.text.trim().length > 0);
        if (!candidateChunks.length) {
            return [];
        }

        // 3. Embed the query
        const queryEmbedding = await getEmbedding(query);

        // 4. Compute cosine similarity for each candidate chunk
        function cosineSim(a, b) {
            let dot = 0, normA = 0, normB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            return dot / (Math.sqrt(normA) * Math.sqrt(normB));
        }

        // 5. Score and sort
        const scored = candidateChunks.map(chunk => ({
            ...chunk,
            score: cosineSim(queryEmbedding, chunk.embedding)
        }));
        scored.sort((a, b) => b.score - a.score);

        // 6. Return topK with text and metadata
        return scored.slice(0, topK).map(doc => ({
            text: doc.text,
            tags: doc.tags,
            source: doc.source,
            heading: doc.heading,
            article: doc.article,
            score: doc.score
        }));
    } catch (err) {
        console.log(err.stack);
        return [];
    } finally {
        await client.close();
    }
}

module.exports = { getQueryResults, getTagsLLM };