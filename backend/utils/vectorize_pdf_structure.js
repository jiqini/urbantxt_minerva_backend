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
const DB_NAME = 'mongodbVSCodePlaygroundDB';
const COLLECTION_NAME = 'chunks';

RETRIES = 3

const data = require('../output_codigo_procesal.json');  // load your .json file

/*
 * This function will loop through a json file and extract every heading/body and store it as a key in mongodb.
 * Then for each body within the heading, the function will call createChunks create chunks of 500 tokens and 
 * 100 tokens that overlap from the previous chunk. 
 */
async function processPDF(data) {
    // let counter = 0

    // loops through the elements in the json file
    for (const element of data) {
        const heading = element.heading;
        const text = element.body;
        const chunks = createChunks(text, 500, 100);
        const embedded = await getEmbedding(chunks);
        // Build hierarchical document
        const doc = {
            heading: heading,
            body_chunks: embedded
        };

        /* print statement to see what is going into the database
        console.log('Document to be stored in MongoDB:');
        console.dir(doc, { depth: 3, maxArrayLength: 10 });

        // testing purposes 
        counter++;
        if (counter == 4) {
            break; 
        } */

        await storeHeadingDoc(doc); 
    }
}

/* 
 * This function takes in text and splits the text by maxTokens into chunks. Returns a chunk list. 
 */
function createChunks(text, maxTokens = 600, overlapTokens = 150) {
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
async function storeHeadingDoc(doc) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Print what will be stored
    console.log('Storing the following document in MongoDB:');
    console.dir(doc, { depth: 3, maxArrayLength: 10 })

    await collection.insertOne(doc);
    await client.close();
}

/*
 * Main entry point
 */
processPDF(data)
  .then(() => console.log('Processing complete.'))
  .catch(err => console.error('Error during processing:', err));