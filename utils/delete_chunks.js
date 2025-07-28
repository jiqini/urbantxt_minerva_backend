const { MongoClient } = require("mongodb");
const readline = require('readline');
require('dotenv').config();

async function deleteChunksBySource() {
  const uri = process.env.EXPO_PUBLIC_MONGODB_URI; // or MONGODB_URI if that's your env var
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("tagged_db");
    const collection = db.collection("tag");

    const docs = await collection.find({ source: "output_new4" }).toArray();
    if (!docs || docs.length === 0) {
      console.log("No chunks found with source: output_new4");
      await client.close();
      return;
    }
    console.log(`Found ${docs.length} chunks with source: output_new4. Previewing first 3:`);
    docs.slice(0, 3).forEach((doc, idx) => {
      console.log(`--- Chunk ${idx + 1} ---`);
      const { embedding, ...docWithoutEmbedding } = doc;
      console.log(JSON.stringify(docWithoutEmbedding, null, 2));
    });
    if (docs.length > 3) {
      console.log(`...and ${docs.length - 3} more.`);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Are you sure you want to delete these chunks? (yes/no): ', async (answer) => {
      if (answer.trim().toLowerCase() === 'yes') {
        const result = await collection.deleteMany({ source: "output_new4" });
        console.log(`🗑️ Deleted ${result.deletedCount} chunks with source: output_new4`);
      } else {
        console.log('Aborted deletion.');
      }
      rl.close();
      await client.close();
    });
  } catch (err) {
    console.error("❌ Error deleting chunks:", err);
    await client.close();
  }
}

deleteChunksBySource();