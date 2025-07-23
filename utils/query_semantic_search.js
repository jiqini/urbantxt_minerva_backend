/*
 * This file takes in a user query, generates its embedding using OpenAI, and searches a MongoDB collection
 * for the most semantically similar body_chunks within each heading. For each heading, it loops over the
 * body_chunks array and performs a vector search on each chunk's text embedding, returning the top matches
 * across all headings and chunks.
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

/*
 * This function takes a user query, generates its embedding, and uses MongoDB Atlas $vectorSearch to find the 
 * top K most similar body_chunks across all headings. For each heading, it returns the most relevant chunks based 
 * on Atlas's cosine similarity.
 */
async function getQueryResults(query, topK = 5) {
    const client = new MongoClient(MONGO_URL);
    try {
        const queryEmbedding = await getEmbedding(query);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Use $vectorSearch to find topK most similar body_chunks across all headings
        const pipeline = [
            {
                $vectorSearch: {
                    index: "embedding_index", // Make sure this matches your Atlas index name
                    queryVector: queryEmbedding,
                    path: "body_chunks.embedding", // Path to the embedding inside body_chunks
                    exact: true,
                    limit: topK
                }
            },
            {
                $project: {
                    _id: 0,
                    heading: 1,
                    text: "$body_chunks.text",
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