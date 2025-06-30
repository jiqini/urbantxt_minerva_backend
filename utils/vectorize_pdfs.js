require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const mongoClient = new MongoClient(process.env.MONGO_URL);
const dbName = 'vector_db';
const collectionName = 'pdf_embeddings';
const folderPath = './pdfs';

function splitText(text, maxLength) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        chunks.push(text.slice(start, start + maxLength));
        start += maxLength;
    }
    return chunks;
}

/*
 * This function processes a PDF file, extracts its text, and creates an embedding for each chunk
 * of text. It then stores the file name, chunk index, text, and embedding in a MongoDB collection.
*/
async function processPdf(filePath, fileName, collection) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    let fullText = '';
    if (typeof data.text == 'string') {
        fullText = data.text;
    }

    const chunkText = splitText(fullText, 1500);
    for (let i = 0; i < chunkText.length; i++) {
        const chunk = chunkText[i];

        try {
            const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: chunk,
            });
            const embedding = response.data[0].embedding;
            await collection.insertOne({
                fileName,
                chunkIndex: i,
                text: chunk,
                embedding,
            });
            console.log('Inserted chunk:', fileName, i);
        } catch (error) {
            console.error('Error embedding chunk', fileName, i, error);
        }
    }
}
async function main(){
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const files = fs.readdirSync(folderPath);
    for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);
        await processPdf(filePath, fileName, collection);
        console.log('Processed file:', fileName);
    }

    await mongoClient.close();
}
main().catch(console.error);