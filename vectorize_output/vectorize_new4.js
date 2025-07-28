
/*
 * Vectorize Consumer Protection Law PDF with LLM-Based Auto-Tagging for RAG
 * Usage: node vectorize_output/vectorize_new4.js
 * Requirements: .env with OpenAI credentials
 */

require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

const Tags = [
  "consumer protection", "consumer rights", "product warranties", "false advertising", "deceptive practices",
  "inspections", "complaints and claims", "mediation", "consumer agency", "sanctions and fines",
  "administrative procedure", "consumer dispute resolution", "Defensoría del Consumidor", "service contracts",
  "retail regulations", "enforcement powers"
];

const data = require('../output_parsed_pdf/output_new4.json');

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
    const prompt = `
You are a legal expert in Salvadoran consumer protection law.

Given the following legal text, identify and return ONLY the relevant tags from this list:
${JSON.stringify(Tags)}

Guidelines:
- Use only tags from the list above. Do NOT invent new tags or use synonyms.
- Skip generic structural terms like "law", "article", "regulation".
- Output a valid JSON array of lowercase strings with only directly relevant tags.

Text:
${text}

Format:
["consumer protection", "false advertising", "sanctions and fines"]
    `.trim();
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a consumer protection law expert for El Salvador.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.0,
            max_tokens: 300,
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

async function storeConsumerLawChunks(data) {
    let previewCount = 0;
    for (const element of data) {
        let body = element.body ? element.body.trim() : null;
        if (!body) continue;
        let heading = element.heading ? element.heading.trim() : null;
        if (heading) {
            const headingMatch = heading.match(/^(Art\.?\s*\d+)(\.-| -)?/i);
            if (headingMatch) {
                heading = headingMatch[1];
            }
        } else {
            const headingMatch = body.match(/^(Art\.?\s*\d+)(\.-| -)?/i);
            if (headingMatch) {
                heading = headingMatch[1];
                body = body.replace(headingMatch[0], '').trim();
                body = body.replace(/^[-.\s]+/, '');
            }
        }
        const chunks = createChunks(body, 1500, 250);
        for (const chunkText of chunks) {
            if (previewCount >= 10) break;
            const embedding = await getEmbedding(chunkText);
            const tags = await getTagsLLM(chunkText);
            const doc = {
                text: chunkText,
                embedding,
                tags,
                source: 'output_new4',
                heading: heading || null
            };
            console.log(`\n--- Chunk ${previewCount + 1} ---`);
            console.dir({ heading: doc.heading, tags: doc.tags, text: doc.text }, { depth: 2, maxArrayLength: 20 });
            previewCount++;
        }
        if (previewCount >= 10) break;
    }
    console.log('\nPreview complete. No data was stored in MongoDB.');
}

storeConsumerLawChunks(data)
    .then(() => console.log('Processing complete.'))
    .catch(err => console.error('Error during processing:', err));
