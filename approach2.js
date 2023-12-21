const { MongoClient } = require('mongodb');
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const mongoUrl = 'mongodb+srv://develup:ErTOHk7NrQdqsV3w@develup.twn8z.mongodb.net/Develup?retryWrites=true&w=majority'; // Update with your MongoDB connection string
const mongoDatabase = 'Develup'; // Update with your MongoDB database name
const mongoCollection = 'jobs'; // Update with your MongoDB collection name

const esNode = 'https://localhost:9200'; // Update with your Elasticsearch node URL
const esIndex = 'job'; // Update with your Elasticsearch index name

async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(mongoDatabase).collection(mongoCollection);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function connectToElasticsearch() {
  try {
    const client = new Client({
        node: esNode,
        auth: {
            username: 'elastic', // Replace with your Elasticsearch username
            password: 'YYlDN3av0U7jcd*NLINs', // Replace with your Elasticsearch password
          },
        ssl: {
            ca: fs.readFileSync('http_ca.crt'), // Provide the path to your CA certificate
            rejectUnauthorized: false,
          }, // Add this line to accept self-signed certificates
          
      });
    console.log('Connected to Elasticsearch');
    return client;
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
}

async function indexDataToElasticsearch(mongoCollection, esClient) {
  try {
    const cursor = mongoCollection.find();
    const data = await cursor.toArray();

    const body = data.flatMap((doc) => [
      { index: { _index: esIndex, _id: doc._id.toString() } },
      doc,
    ]);

    const { body: bulkResponse } = await esClient.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1],
          });
        }
      });
      console.error('Failed to index some documents:', erroredDocuments);
    } else {
      console.log('Successfully indexed all documents to Elasticsearch');
    }
  } catch (error) {
    console.error('Error indexing data to Elasticsearch:', error);
  }
}

async function main() {
  const mongoCollection = await connectToMongo();
  const esClient = await connectToElasticsearch();

  if (mongoCollection && esClient) {
    await indexDataToElasticsearch(mongoCollection, esClient);
  }

  process.exit(0);
}

main();
