
/*
 * Vectorize Tax Law PDF with LLM-Based Auto-Tagging for RAG
 * Usage: node vectorize_output/vectorize_new2.js
 * Requirements: .env with OpenAI credentials
 */

require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

const Tags = [
  "tax amnesty", "fiscal forgiveness", "debt regularization", "tax compliance", "tax obligations",
  "customs penalties", "social security debt", "ISSS", "Dirección General de Impuestos Internos",
  "Dirección General de Aduanas", "tributary law", "transitional tax law", "tax relief El Salvador",
  "government debt programs", "taxpayer benefits", "payment plans", "late tax payments",
  "legal deadlines", "reduced interest and penalties"
];

const data = require('../output_parsed_pdf/output_new2.json');

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
    for (let attempt = 0; attempt < 3; attempt++) {
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
    const prompt = `Given the following tax law text, select all applicable tags from this list ONLY (do not invent new tags, do not use synonyms): ${JSON.stringify(Tags)}. Avoid generic tags like "law" or "article".\n\nText: ${text}\n\nReturn the tags as a JSON array of lowercase strings, like:\n["tax amnesty", "tax compliance", "payment plans"]`;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a tax law expert for El Salvador.' },
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

const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'tagged_db';
const COLLECTION_NAME = 'tag';

async function storeTaxLawChunks(data) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    let elementIdx = 0;
    for (const element of data) {
        elementIdx++;
        let body = element.body ? element.body.trim() : null;
        let heading = element.heading ? element.heading.trim() : null;
        // Extract article from body if present, strip '.-' that follows
        let article = null;
        if (body) {
            // Match 'Art. [number].-' or 'Art. [number] -'
            const artRegex = /(Art\.?\s*\d+)(\.-| -)?/i;
            const match = body.match(artRegex);
            if (match) {
                article = match[1];
                // Remove the full match (article + '.-' or ' -') from body
                body = body.replace(match[0], '').trim();
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
                source: 'output_new2',
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

storeTaxLawChunks(data)
    .then(() => console.log('Processing complete.'))
    .catch(err => console.error('Error during processing:', err));
