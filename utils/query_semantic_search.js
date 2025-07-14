/*
 * This file takes in a user query, generates its embedding using OpenAI, and uses a MongoDB aggregation pipeline 
 * to find the top K most similar documents from the vector database.
 */

const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'mongodbVSCodePlaygroundDB';
const COLLECTION_NAME = 'chunks';

// Function to get the embedding for a query string
async function getEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
    });
    return response.data[0].embedding;
}

// Function to get the results of a vector query
async function getQueryResults(query) {
    const client = new MongoClient(MONGO_URL);
    try {
        // Get embedding for a query, vectorizes query
        const queryEmbedding = await getEmbedding(query);

        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const pipeline = [
            {
                $vectorSearch: {
                    index: "embedding_index", // Make sure this matches your Atlas index name
                    queryVector: queryEmbedding,
                    path: "embedding", // Make sure this matches your field name
                    exact: true,
                    limit: 5
                }
            }, {
                $project: {
                    _id: 0,
                    text: 1,
                    url: 1,
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