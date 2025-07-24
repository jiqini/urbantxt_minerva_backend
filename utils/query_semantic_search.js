/*
 * This file takes in a user query, generates its embedding using OpenAI, and searches a MongoDB collection
 * for the most semantically similar chunks. Each chunk is a flat document with { text, embedding }.
 */

const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'database_elSalvador';
const COLLECTION_NAME = 'chunks';

// Function to get the embedding for a query string
async function getEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
    });
    return response.data[0].embedding;
}

/*
 * This function takes a user query, generates its embedding, and uses MongoDB Atlas $vectorSearch to find the 
 * top K most similar chunks. Each chunk is a flat document with { text, embedding }.
 */
async function getQueryResults(query, topK = 5) {
    const client = new MongoClient(MONGO_URL);
    try {
        const queryEmbedding = await getEmbedding(query);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Use $vectorSearch to find topK most similar chunks
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index", // Make sure this matches your Atlas index name
                    queryVector: queryEmbedding,
                    path: "embedding", // Path to the embedding at the top level
                    exact: true,
                    limit: topK
                }
            },
            {
                $project: {
                    _id: 0,
                    text: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ];

        const result = collection.aggregate(pipeline);
        const arrayOfQueryDocs = [];
        for await (const doc of result) {
            arrayOfQueryDocs.push(doc);
        }
        return arrayOfQueryDocs;
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

module.exports = { getQueryResults };