/*
 * Vectorize Civil Procedure/Civil Code PDF with LLM-Based Auto-Tagging for RAG
 * Usage: node vectorize_output/vectorize_codigo.js
 * Requirements: .env with OpenAI credentials
 */

require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');
const splitter = require('sentence-splitter');
const { encode } = require('gpt-3-encoder');

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

const Tags = [
  'civil procedure',
  'civil code',
  'lawsuit process',
  'legal procedure',
  'appeals',
  'evidence rules',
  'trial process',
  'commercial law',
  'judicial hearings',
  'procedural law',
  'jurisdiction',
  'deadlines',
  'notifications',
  'motions',
  'remedies',
  'civil court',
  'litigation',
  'constitution',
  'legislative power',
  'executive power',
  'judicial power',
  'state organization',
  'president of the republic',
  'human rights',
  'constitutional rights',
  'due process',
  'presumption of innocence',
  'freedom of expression',
  'freedom of religion',
  'right to privacy',
  'habeas corpus',
  'nationality',
  'citizenship',
  'electoral process',
  'political parties',
  'public officials',
  'family rights',
  "children's rights",
  'elderly rights',
  'social security',
  'public health',
  'education rights',
  'public finance',
  'national budget',
  'tax system',
  'natural resources',
  'flag and symbols',
  'language',
  'official religion',
  'national holidays',
  'child custody',
  'shared custody',
  'visitation rights',
  'divorce',
  'contested divorce',
  'child support',
  'spousal support',
  'parental authority',
  'adoption',
  'domestic violence',
  'protection order',
  'property separation',
  'paternity',
  'alimony',
  'lawsuit filing',
  'civil trial',
  'evidence submission',
  'appeals process',
  'court deadlines',
  'judicial decision',
  'legal representation',
  'jurisdiction',
  'court notification',
  'procedural hearing',
  'default judgment',
  'court documentation',
  'domestic abuse',
  'child abuse',
  'restraining order',
  'criminal complaint',
  'protective measures',
  'request custody',
  'modify custody',
  'enforce visitation',
  'file for divorce',
  'request protection order',
  'appeal ruling',
  'petition for adoption',
  'challenge custody',
  'request spousal support',
  'family law el salvador',
  'civil procedure el salvador',
  'court process',
  'el salvador family court',
  'legal process el salvador',
  'procedural code',
  'tax amnesty',
  'fiscal forgiveness',
  'debt regularization',
  'tax compliance',
  'tax obligations',
  'customs penalties',
  'social security debt',
  'ISSS',
  'Dirección General de Impuestos Internos',
  'Dirección General de Aduanas',
  'tributary law',
  'transitional tax law',
  'tax relief El Salvador',
  'government debt programs',
  'taxpayer benefits',
  'payment plans',
  'late tax payments',
  'legal deadlines',
  'reduced interest and penalties',
  'victim protection',
  'gender violence',
  'domestic violence',
  'protective measures',
  'sexual violence',
  'judicial protection',
  'victim rights',
  'psychosocial support',
  'legal assistance',
  'restraining order',
  'preventative measures',
  'reparations',
  'violence against women',
  'violence against children',
  'court proceedings',
  'law enforcement',
  'criminal justice process',
  'human rights',
  'due process',
  'consumer protection',
  'consumer rights',
  'product warranties',
  'false advertising',
  'deceptive practices',
  'inspections',
  'complaints and claims',
  'mediation',
  'consumer agency',
  'sanctions and fines',
  'administrative procedure',
  'consumer dispute resolution',
  'Defensoría del Consumidor',
  'service contracts',
  'retail regulations',
  'enforcement powers',
  'divorce',
  'custody',
  'shared custody',
  'visitation rights',
  'parental authority',
  'parental responsibility',
  'alimony',
  'child support',
  'marriage annulment',
  'adoption',
  'joint adoption',
  'individual adoption',
  'domestic violence',
  'protective measures',
  'property division',
  'family mediation',
  'minor protection',
  'emancipation',
  'family court procedure',
  'father’s rights',
  'mother’s rights',
  'cohabitation',
  'separation',
  'civil union',
  'paternity',
  'maternity',
  'guardianship',
  'legal representative',
  'child removal',
  'suspension of rights',
  'modification of measures',
  'family residence',
  'child travel',
  'child abduction',
  'custody transfer',
  'special tutor',
  'child education',
  'child housing',
  'spousal support',
  'family registry',
  'name change',
];

const data = require('../../output_parsed_pdf/output_codigo_procesal.json');

function splitSentences(text) {
  return splitter
    .split(text)
    .filter((part) => part.type === 'Sentence')
    .map((s) => s.raw.trim());
}

function createChunks(body, maxTokens = 1500, overlapTokens = 250) {
  const sentences = splitSentences(body);
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;
  let i = 0;
  while (i < sentences.length) {
    const sentence = sentences[i];
    const sentenceTokens = encode(sentence).length;
    if (currentTokens + sentenceTokens > maxTokens) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        // Overlap
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
      }
      // If sentence too long, force add
      if (currentChunk.length === 0) {
        chunks.push(sentence);
        i++;
        currentChunk = [];
        currentTokens = 0;
      } else {
        continue;
      }
    } else {
      currentChunk.push(sentence);
      currentTokens += sentenceTokens;
      i++;
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

async function getEmbedding(text) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (err) {
      console.warn(
        `[Embedding] OpenAI API failed (attempt ${attempt + 1}):`,
        err.message
      );
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error('OpenAI embedding failed after retries');
}

async function getTagsLLM(text) {
  const prompt = `
You are a legal expert in El Salvador's civil procedure and civil code.

Your task is to classify the following legal text by selecting only the relevant tags from this fixed list:
${JSON.stringify(Tags)}

Strict rules:
- Use only the tags from the list. Do not create new tags, use synonyms, or modify existing tags.
- Do not include vague or generic terms like "law", "article", or "legal".
- Only include tags that are clearly relevant to the content. Be concise and precise.

Legal text:
"""
${text}
"""

Return your answer as a valid JSON array of lowercase strings. Example:
["civil procedure", "appeals", "deadlines"]
`.trim();

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a legal expert specializing in El Salvador’s civil procedure and civil code. Only respond with valid tags from the approved list and no extra commentary.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.0,
        max_tokens: 300,
      });
      // Extract JSON array from response
      const content = response.choices[0].message.content;
      const match = content.match(/\[.*\]/s);
      if (!match) throw new Error('No JSON array found in LLM response');
      let tags = JSON.parse(match[0]);
      // Post-process: lowercase, deduplicate, filter to tag list
      tags = Array.from(new Set(tags.map((t) => t.toLowerCase())));
      tags = tags.filter((t) => Tags.includes(t));
      return tags;
    } catch (err) {
      console.warn(
        `[Tagging] OpenAI LLM failed (attempt ${attempt + 1}):`,
        err.message
      );
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return [];
}

const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.EXPO_PUBLIC_MONGODB_URI;
const DB_NAME = 'tagged_db';
const COLLECTION_NAME = 'tag';

async function storeCodigoChunks(data) {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    let chunkCount = 0;
    for (const element of data) {
      let body = element.body ? element.body.trim() : null;
      if (!body) continue;
      let article = null;
      let articleMatch = body.match(/^(Art\.?\s*\d+)(\.-| -)?/i);
      if (articleMatch) {
        article = articleMatch[1];
        body = body.replace(articleMatch[0], '').trim();
        body = body.replace(/^[-.\s]+/, '');
      }
      let heading = element.heading ? String(element.heading).trim() : null;
      const chunks = createChunks(body, 1500, 250);
      for (const chunkText of chunks) {
        const embedding = await getEmbedding(chunkText);
        const tags = await getTagsLLM(chunkText);
        const doc = {
          text: chunkText,
          embedding,
          tags,
          source: 'codigo_procesal',
          article: article || null,
          heading: heading || null,
        };
        // Preview chunk before storing/skipping
        console.dir(
          {
            text: doc.text,
            tags: doc.tags,
            embedding_preview: doc.embedding ? doc.embedding.slice(0, 8) : null,
          },
          { depth: 2, maxArrayLength: 20 }
        );
        // Check for duplicate by text
        const exists = await collection.findOne({ text: doc.text });
        if (exists) {
          console.log(
            '[MongoDB] Skipping duplicate chunk:',
            doc.text.slice(0, 60) + '...'
          );
        } else {
          await collection.insertOne(doc);
          chunkCount++;
          console.log(
            `[MongoDB] Inserted chunk #${chunkCount}:`,
            doc.text.slice(0, 60) + '...'
          );
        }
      }
    }
    console.log(`\nInserted ${chunkCount} new chunks into MongoDB.`);
  } catch (err) {
    console.error('Error during MongoDB operation:', err);
  } finally {
    await client.close();
  }
}

storeCodigoChunks(data)
  .then(() => console.log('Processing complete.'))
  .catch((err) => console.error('Error during processing:', err));
