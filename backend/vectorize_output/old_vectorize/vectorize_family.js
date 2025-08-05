/*
 * Description:
 *   This script reads output_family.json (parsed from family law PDF),
 *   splits each body into overlapping chunks (never splitting sentences),
 *   prepends the heading (and Art. [number] if present) to each chunk as specified,
 *   generates OpenAI embeddings for each chunk, and stores the results in MongoDB.
 *   Prints each chunk before storing. Deduplication is based on full chunk text.
 *
 * Usage:
 *   - Configure your .env file with OPENAI_API_KEY and MONGODB URI.
 *   - Run: node utils/vectorize_family.js
 *
 * Author: Ji Qi Ni, July 2025
 */

const fs = require('fs');
require('dotenv').config();

const { OpenAI } = require('openai');
const { MongoClient } = require('mongodb');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');
const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'database_elSalvador';
const COLLECTION_NAME = 'chunks';

RETRIES = 3;

const data = require('../output_family.json'); // load your .json file

// Helper: Find Art. [number] in first 10 words of a string
function findArticleString(text) {
    const words = text.split(/\s+/).slice(0, 10).join(' ');
    const artRegex = /(Art\.?|art\.?)[ ]*\d+/i;
    const match = words.match(artRegex);
    return match ? match[0] : null;
}

// Helper: Split text into sentences
function splitSentences(text) {
    return splitter.split(text)
        .filter(part => part.type === 'Sentence')
        .map(s => s.raw.trim());
}

// Main chunking function
function createChunksWithHeading(heading, body, maxTokens = 1500, overlapTokens = 250) {
    const sentences = splitSentences(body);
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    let artString = findArticleString(body);
    let firstArtChunk = true;
    let i = 0;
    while (i < sentences.length) {
        const sentence = sentences[i];
        const sentenceTokens = encode(sentence).length;
        // If adding this sentence would exceed maxTokens, finalize the current chunk
        if (currentTokens + sentenceTokens > maxTokens) {
            if (currentChunk.length > 0) {
                // Prepend heading (and Art. [number] if needed)
                let chunkText;
                if (artString && !firstArtChunk) {
                    chunkText = `${heading} ${artString}: ${currentChunk.join(' ')}`;
                } else {
                    chunkText = `${heading}: ${currentChunk.join(' ')}`;
                }
                chunks.push(chunkText);
                // Create overlap for next chunk
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
                firstArtChunk = false;
            }
            // If the sentence itself is too long to fit in an empty chunk, force add it and move on to avoid infinite loop
            if (currentChunk.length === 0) {
                let chunkText;
                if (artString && !firstArtChunk) {
                    chunkText = `${heading} ${artString}: ${sentence}`;
                } else {
                    chunkText = `${heading}: ${sentence}`;
                }
                chunks.push(chunkText);
                i++;
                firstArtChunk = false;
                currentChunk = [];
                currentTokens = 0;
            }
            // Otherwise, do not increment i here, so the sentence is retried in the new chunk
            else {
                continue;
            }
        } else {
            currentChunk.push(sentence);
            currentTokens += sentenceTokens;
            i++;
        }
    }
    // Add any remaining sentences as the last chunk
    if (currentChunk.length > 0) {
        let chunkText;
        if (artString && !firstArtChunk) {
            chunkText = `${heading} ${artString}: ${currentChunk.join(' ')}`;
        } else {
            chunkText = `${heading}: ${currentChunk.join(' ')}`;
        }
        chunks.push(chunkText);
    }
    return chunks;
}

// Embedding function
async function getEmbedding(chunks) {
    const results = [];
    let chunkIdx = 0;
    for (const text of chunks) {
        chunkIdx++;
        let attempt = 0;
        let success = false;
        let embedding;
        let startTime = Date.now();
        console.log(`[Embedding] Starting chunk #${chunkIdx} (first 60 chars): ${text.slice(0, 60)}...`);
        while (attempt < RETRIES && !success) {
            try {
                const response = await openai.embeddings.create({
                    model: 'text-embedding-ada-002',
                    input: text,
                });
                embedding = response.data[0].embedding;
                success = true;
            } catch (error) {
                attempt++;
                console.warn(`[Embedding] OpenAI API failed (attempt ${attempt}):`, error.message);
                await new Promise(r => setTimeout(r, 2000 * attempt));
            }
        }
        let elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        if (!success) {
            console.error(`[Embedding] Failed after ${RETRIES} attempts for chunk #${chunkIdx}`);
            throw new Error(`OpenAI API failed after ${RETRIES} attempts`);
        } else {
            console.log(`[Embedding] Success for chunk #${chunkIdx} in ${elapsed}s`);
        }
        results.push({ text, embedding });
    }
    return results;
}

// Store in MongoDB
async function storeChunk(doc, collection) {
    console.log('[MongoDB] Storing the following document:');
    console.dir(doc, { depth: 3, maxArrayLength: 10 });
    const start = Date.now();
    try {
        await collection.insertOne(doc);
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`[MongoDB] Inserted in ${elapsed}s`);
    } catch (err) {
        console.error('[MongoDB] Error inserting document:', err);
        throw err;
    }
}

// Main entry point
async function processFamilyLaw(data) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    let previewCount = 0;
    let previewDone = false;
    let elementIdx = 0;
    for (const element of data) {
        elementIdx++;
        const heading = element.heading ? element.heading.trim() : '';
        const body = element.body ? element.body.trim() : '';
        if (!body) continue;
        console.log(`\n[Processing] Element #${elementIdx}: heading='${heading.slice(0, 40)}...'`);
        // Use default chunking params
        const chunks = createChunksWithHeading(heading, body, 1500, 250);
        console.log(`[Processing] Created ${chunks.length} chunks for element #${elementIdx}`);
        if (chunks.length > 0) {
            console.log(`[DEBUG] First chunk: ${chunks[0].slice(0, 100)}`);
        }
        let embedded;
        try {
            embedded = await getEmbedding(chunks);
        } catch (err) {
            console.error(`[Error] Embedding failed for element #${elementIdx}:`, err);
            continue;
        }
        let chunkObjIdx = 0;
        for (const chunkObj of embedded) {
            chunkObjIdx++;
            if (!previewDone) {
                previewCount++;
                console.log(`Chunk #${previewCount}`);
                console.dir(chunkObj, { depth: 2 });
                if (previewCount >= 15) {
                    console.log('Previewed 15 chunks. Now storing all chunks in MongoDB...');
                    previewDone = true;
                }
                if (!previewDone) continue;
            }
            // Store in MongoDB, skip duplicates
            let exists;
            let findStart = Date.now();
            try {
                exists = await collection.findOne({ text: chunkObj.text });
            } catch (err) {
                console.error(`[MongoDB] Error during findOne for chunk #${chunkObjIdx} of element #${elementIdx}:`, err);
                continue;
            }
            let findElapsed = ((Date.now() - findStart) / 1000).toFixed(2);
            if (exists) {
                console.log(`[MongoDB] Skipping duplicate chunk (checked in ${findElapsed}s):`, chunkObj.text.slice(0, 60) + '...');
                continue;
            }
            try {
                await storeChunk(chunkObj, collection);
            } catch (err) {
                console.error(`[MongoDB] Error inserting chunk #${chunkObjIdx} of element #${elementIdx}:`, err);
            }
        }
    }
    await client.close();
}

processFamilyLaw(data)
   .then(() => console.log('Processing complete.'))
   .catch(err => console.error('Error during processing:', err));
