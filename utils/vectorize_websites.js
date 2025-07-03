require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const pdf = require('pdf-parse');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = 'legal_data';
const COLLECTION_NAME = 'chunks';
const CHUNK_SIZE = 1500;

////////// F(X) /////////////
function cleanText(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
        .replace(/<[^>]+>/g, ' ') // Remove all other HTML tags
        .replace(/\s+/g, ' ') // Remove extra white space
        .trim(); // Trim leading and trailing spaces
}

function splitText(text, maxLength = CHUNK_SIZE) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + maxLength, text.length);
        chunks.push(text.slice(start, end));
        start = end;
    }

    return chunks;
}
////////////////////////////

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

        while (attempt < retries && !success) {
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
            throw new Error(`OpenAI API failed after ${retries} attempts`);
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