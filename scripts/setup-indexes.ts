import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_API_KEY || '';

async function setupIndexes() {
  console.log('Setting up MongoDB indexes...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ZSHIRT');

    const ordersCollection = db.collection('orders');

    // Index for finding orders by paymobOrderId
    await ordersCollection.createIndex({ paymobOrderId: 1 }, { unique: true, sparse: true });
    console.log('Created index on paymobOrderId');

    // Index for finding orders by clerkUserId
    await ordersCollection.createIndex({ clerkUserId: 1 });
    console.log('Created index on clerkUserId');

    console.log('MongoDB indexes set up successfully.');
  } catch (error) {
    console.error('An error occurred during index setup:', error);
  } finally {
    await client.close();
  }
}

setupIndexes();
