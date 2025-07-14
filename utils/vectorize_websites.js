/*
 * This file processes PDFs and websites, extracts and cleans text, splits it into overlapping sentence-based chunks,
 * generates OpenAI embeddings for each chunk, and stores the results in MongoDB Atlas for semantic search.
 */

require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const pdf = require('pdf-parse');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');

const RETRIES = 2;


const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'mongodbVSCodePlaygroundDB';
const COLLECTION_NAME = 'chunks';

////////// F(X) /////////////
function cleanText(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
        .replace(/<[^>]+>/g, ' ') // Remove all other HTML tags
        .replace(/\s+/g, ' ') // Remove extra white space
        .trim(); // Trim leading  nd trailing spaces
}

/* 
 * This function takes in text and splits the text by maxTokens into chunks. Returns a chunk list. 
 */
function splitText(text, maxTokens = 500, overlapTokens = 100) {
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
////////////////////////////

/*
 * This function processes a PDF file, extracts its text, and creates an embedding for each chunk
 * of text. It then stores the file name, chunk index, text, and embedding in a MongoDB collection.
*/
async function processPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    // Optionally clean the text: return cleanText(data.text || '');
    return data.text || '';
}

//////// SCRAPE ////////////
async function scrapeWebsite(url) {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const bodyText = $('body').text(); 
    return cleanText(bodyText);
}

async function scrapeDynamic(url) {
    const browser = await puppeteer.launch({ headless : true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return cleanText(content);
}
///////////////////////////

/////// EMBEDDING /////////
async function getEmbeddings(chunks) {
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
///////////////////////////

////////// MONGO ///////////
async function storeChunks(chunks, source) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const docs = chunks.map((chunk, index) => ({
        url: source,
        chunkIndex: index,
        text: chunk.text,
        embedding: chunk.embedding,
    }));

    // Print what will be stored
    console.log('Storing the following documents in MongoDB:');
    console.dir(docs, { depth: 2, maxArrayLength: 5 })

    await collection.insertMany(docs);
    await client.close();
}
///////////////////////////

////////// MAIN ////////////
async function run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
            Usage: 
            node vectorize_websites.js <sourceType> <sourcePath|URL>
            source type can be static, dynamic, or pdf

            node vectorize_websites.js batch ./sources.json
            batch simply refers to a group of sources in a JSON file`);
        return;
    }

    if (args[0] === 'batch') {
        const filePath = args[1];
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }

        const sources = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const { type, path: sourcePath } of entries) {
            console.log(`Processing ${type} source: ${sourcePath}`);
            await processSingleSource(type, sourcePath);
        }
        return;
    }

    const sourceType = args[0];
    const sourcePath = args[1];

    await processSingleSource(sourceType, sourcePath);
}

async function processSingleSource(sourceType, source) {
    let fullText;

    try {
        if (sourceType === 'static') {
            console.log(`Scraping static website: ${source}`);
            fullText = await scrapeStatic(source);
        } else if (sourceType === 'dynamic') {
            console.log(`Scraping dynamic website: ${source}`);
            fullText = await scrapeDynamic(source);
        } else if (sourceType === 'pdf') {
            console.log(`Processing PDF file: ${source}`);
            fullText = await processPDF(source);
        } else {
            throw new Error(`Unknown source type: ${sourceType}`);
        }

        console.log(`Splitting text into chunks..`);
        const rawChunks = splitText(fullText);
        console.log(`${rawChunks.length} chunks created`);

        console.log(`Generating embeddings..`);
        const chunksWithEmbeddings = await getEmbeddings(rawChunks);

        console.log(`Storing chunks in MongoDB..`);
        await storeChunks(chunksWithEmbeddings, source);

        console.log(`Processing completed for ${sourceType} source: ${source}`);
    } catch (error) {
        console.error(`Error processing ${sourceType} source: ${source}`);
        console.error(error);
    }
}

run();