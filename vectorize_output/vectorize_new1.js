/*
 * Vectorize Legal/Civil PDF with LLM-Based Auto-Tagging for RAG
 * Usage: node vectorize_output/vectorize_new1.js
 * Requirements: .env with OpenAI and MongoDB credentials
 */

require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');
const { MongoClient } = require('mongodb');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'tagged_db';
const COLLECTION_NAME = 'tag';
const RETRIES = 3;

const Tags = [
  // Family Law (Core)
  "child custody", "shared custody", "visitation rights", "divorce", "contested divorce", "child support", "spousal support", 
  "parental authority", "adoption", "domestic violence", "protection order", "property separation", "paternity", "alimony",
  // Civil Procedure
  "lawsuit filing", "civil trial", "evidence submission", "appeals process", "court deadlines", "judicial decision", 
  "legal representation", "jurisdiction", "court notification", "procedural hearing", "default judgment", "court documentation",
  // Criminal (family law context)
  "domestic abuse", "child abuse", "restraining order", "criminal complaint", "protective measures",
  // Legal Actions / Requests
  "request custody", "modify custody", "enforce visitation", "file for divorce", "request protection order", "appeal ruling", 
  "petition for adoption", "challenge custody", "request spousal support",
  // Contextual Tags
  "family law el salvador", "civil procedure el salvador", "court process", "el salvador family court", "legal process el salvador",
  "procedural code"
];

const data = require('../output_parsed_pdf/output_new1.json');

function splitSentences(text) {
    return splitter.split(text)
        .filter(part => part.type === 'Sentence')
        .map(s => s.raw.trim());
}

function createChunks(body, maxTokens = 1500, overlapTokens = 250) {
    const sentences = splitSentences(body);
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    let i = 0;
    while (i < sentences.length) {
        const sentence = sentences[i];
        const sentenceTokens = encode(sentence).length;
        if (currentTokens + sentenceTokens > maxTokens) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(' '));
            // Overlap
            let overlap = [];
            let overlapCount = 0;
            for (let j = currentChunk.length - 1; j >= 0; j--) {
                const tokenCount = encode(currentChunk[j]).length;
                overlapCount += tokenCount;
                if (overlapCount > overlapTokens) break;
                overlap.unshift(currentChunk[j]);
            }
            currentChunk = [...overlap];
            currentTokens = encode(currentChunk.join(' ')).length;
            }
            // If sentence too long, force add
            if (currentChunk.length === 0) {
                chunks.push(sentence);
                i++;
                currentChunk = [];
                currentTokens = 0;
            } else {
                continue;
            }
        } else {
            currentChunk.push(sentence);
            currentTokens += sentenceTokens;
        i++;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }
    return chunks;
}

async function getEmbedding(text) {
    for (let attempt = 0; attempt < RETRIES; attempt++) {
        try {
            const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });
        return response.data[0].embedding;
        } catch (err) {
            console.warn(`[Embedding] OpenAI API failed (attempt ${attempt + 1}):`, err.message);
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        }
    }
    throw new Error('OpenAI embedding failed after retries');
}

async function getTagsLLM(text) {
    const prompt = `Given the following legal or civil text, select all applicable tags from this list ONLY (do not invent new tags, do not use synonyms): ${JSON.stringify(Tags)}. Avoid generic tags like "law" or "article".\n\nText: ${text}\n\nReturn the tags as a JSON array of lowercase strings, like:\n["divorce", "visitation rights", "parental authority"]`;
    for (let attempt = 0; attempt < RETRIES; attempt++) {
        try {
            const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a legal and civil procedure expert for El Salvador.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.0,
            max_tokens: 100,
            });
            // Extract JSON array from response
            const content = response.choices[0].message.content;
            const match = content.match(/\[.*\]/s);
            if (!match) throw new Error('No JSON array found in LLM response');
            let tags = JSON.parse(match[0]);
            // Post-process: lowercase, deduplicate, filter to tag list
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

async function processLegalText(data) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    let elementIdx = 0;
    for (const element of data) {
        elementIdx++;
        let body = element.body ? element.body.trim() : null;
        let heading = element.heading ? element.heading.trim() : null;
        // Extract article from body if present
        let article = null;
        if (body) {
            const artRegex = /(Art\.\?\s*\d+)/i;
            const match = body.match(artRegex);
            if (match) {
                article = match[1];
                body = body.replace(article, '').trim();
                body = body.replace(/^[-.\s]+/, '');
            }
        }
        if (!body) continue;
        const chunks = createChunks(body, 1500, 250);
        for (const chunkText of chunks) {
            const embedding = await getEmbedding(chunkText);
            const tags = await getTagsLLM(chunkText);
            const doc = {
                text: chunkText,
                embedding,
                tags,
                source: 'output_new1',
                heading,
                article: article || null
            };
            console.log('\n[Storing Chunk]');
            console.dir(doc, { depth: 3, maxArrayLength: 20 });
            let exists = await collection.findOne({ text: doc.text });
            if (exists) {
                console.log('[MongoDB] Skipping duplicate chunk:', doc.text.slice(0, 60) + '...');
                continue;
            }
            await collection.insertOne(doc);
            console.log('[MongoDB] Inserted chunk:', doc.text.slice(0, 60) + '...');
        }
    }
    await client.close();
}

processLegalText(data)
    .then(() => console.log('Processing complete.'))
    .catch(err => console.error('Error during processing:', err));
