/*
 * Description:
 *   This script reads a structured JSON file containing headings and body text (parsed from a PDF),
 *   splits each body into overlapping chunks, generates OpenAI embeddings for each chunk,
 *   and (optionally) stores the results in MongoDB in a hierarchical format:
 *     {
 *       heading: <string>,
 *       body_chunks: [
 *         { text: <string>, embedding: <array> },
 *         ...
 *       ]
 *     }
 *
 * Usage:
 *   - Configure your .env file with OPENAI_API_KEY and MONGODB URI.
 *   - Run: node utils/vectorize_pdf_structure.js
 *   - The script prints each document to be stored; uncomment the storage line to persist to MongoDB.
 * 
 * Author: Ji Qi Ni, July 15, 2025
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

RETRIES = 3

const data = require('../output_constitution.json');  // load your .json file

/*
 * This function will loop through a json file and extract every body (ignoring heading and other metadata) and store 
 * each chunk as a separate document in mongodb. For each body, the function will call createChunks to create chunks of 
 * 550 tokens and 125 tokens that overlap from the previous chunk. Each chunk will be stored as { text: <string>, embedding: <array> } 
 * at the top level of the document. If a chunk with the same text already exists in the collection, it will be skipped to avoid 
 * duplicate vectorization/storage.
 */
async function processPDF(data) {
    // Enable MongoDB connection
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // let chunkCounter = 0; // Counter for previewing chunks
    for (const element of data) {
        const heading = element.heading || "";
        const body = element.body;
        if (!body || body.trim() === "") continue; // Skip empty bodies

        // Detect article string in heading or at start of body (case-insensitive)
        let articleMatch = null;
        // Regex: Art. or art. followed by optional space and numbers (e.g., Art. 123)
        const artRegex = /(Art\.?|art\.?)[ ]*\d+/;
        if (heading && artRegex.test(heading)) {
            articleMatch = heading.match(artRegex)[0];
        } else if (body && artRegex.test(body)) {
            // Only check start of body (first 40 chars)
            const bodyStart = body.slice(0, 40);
            if (artRegex.test(bodyStart)) {
                articleMatch = bodyStart.match(artRegex)[0];
            }
        }

        // Set chunking params based on article detection
        let maxTokens = 1500;
        let overlapTokens = 250;
        if (articleMatch) {
            maxTokens = 2000;
            overlapTokens = 450;
        }

        // Build the base text for chunking: always prepend heading if present
        let baseText = body;
        if (heading && heading.trim() !== "") {
            baseText = heading.trim() + "\n" + body.trim();
        }

        // Create chunks
        let chunks = createChunks(baseText, maxTokens, overlapTokens);

        // Prepend article string to every chunk if detected
        if (articleMatch) {
            chunks = chunks.map(chunk => articleMatch + ": " + chunk);
        }

        // Get embeddings for chunks
        const embedded = await getEmbedding(chunks);

        // Store each chunk as a separate document, skip if text already exists
        for (const chunkObj of embedded) {
            const exists = await collection.findOne({ text: chunkObj.text });
            if (exists) {
                console.log('Skipping duplicate chunk:', chunkObj.text.slice(0, 60) + '...');
                continue;
            }
            console.log('Document to be stored in MongoDB:');
            console.dir(chunkObj, { depth: 2 });
            await storeHeadingDoc(chunkObj, collection);
        }
    }
    await client.close();
}

/* 
 * This function takes in text and splits the text by maxTokens into chunks. Returns a chunk list. 
 */
function createChunks(text, maxTokens = 550, overlapTokens = 125) {
    // Split the text into sentences using sentence-splitter
    const sentences = splitter.split(text)
        .filter(part => part.type === 'Sentence')
        .map(s => s.raw.trim());

    const chunks = [];  // Array to hold all chunks
    let currentChunk = [];  // Current chunk being built
    let currentTokens = 0;  // Token count for the current chunk

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const sentenceTokens = encode(sentence).length;  // Token count for current sentence

        // If adding this sentence would exceed maxTokens, finalize the current chunk
        if (currentTokens + sentenceTokens > maxTokens) {
            chunks.push(currentChunk.join(' '));  // Add the chunk to the list

            // Create overlap from the end of the currentChunk
            let overlap = [];
            let overlapCount = 0;
            // Add sentences from the end of the current chunk until overlapTokens is reached
            for (let j = currentChunk.length - 1; j >= 0; j--) {
                const tokenCount = encode(currentChunk[j]).length;
                overlapCount += tokenCount;
                if (overlapCount > overlapTokens) break;
                overlap.unshift(currentChunk[j]);  // Add to the start of overlap array
            }
            // Start the new chunk with the overlap
            currentChunk = [...overlap];
            currentTokens = encode(currentChunk.join(' ')).length;
        }

        currentChunk.push(sentence);  
        currentTokens += sentenceTokens;
    }
    
    // Add any remaining sentences as the last chunk
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '))
    }

    return chunks;
}

/*
 * This function takes in a chunk and uses openai's text-embedding-ada-002 to embed text.
 * Returns a vectorized embedding of the chunk 
 */
async function getEmbedding(chunks) {
    const results = [];
    for (const text of chunks) {
        let attempt = 0;
        let success = false;
        let embedding;

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
                console.warn(`OpenAI API failed (attempt ${attempt}):`, error.message);
                await new Promise(r => setTimeout(r, 2000 * attempt)); // n^i backoff
            }
        }

        if (!success) {
            throw new Error(`OpenAI API failed after ${RETRIES} attempts`);
        }
        results.push({ text, embedding });
    }
    return results;
}

/*
 * This function takes a hierarchical document (one per heading) and stores it in MongoDB.
 */
async function storeHeadingDoc(doc, collection) {
    // Print what will be stored
    console.log('Storing the following document in MongoDB:');
    console.dir(doc, { depth: 3, maxArrayLength: 10 })
    await collection.insertOne(doc);
}

/*
 * Main entry point
 */
processPDF(data)
  .then(() => console.log('Processing complete.'))
  .catch(err => console.error('Error during processing:', err));