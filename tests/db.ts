import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

const connect = async () => {
  // Connecting to the database
  try {
    await mongod.start();
    const uri = await mongod.getUri();

    await mongoose.connect(uri);
  } catch (err) {
    console.log('database connection failed. exiting now...');
    throw err;
  }
};

const closeDatabase = async () => {
  // Connecting to the database
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  } catch (err) {
    console.log('database close failed. exiting now...');
    throw err;
  }
};

const clearDatabase = async () => {
  // Connecting to the database
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  } catch (err) {
    console.log('Collection dropping failed. exiting now...');
    throw err;
  }
};

export { connect, closeDatabase, clearDatabase };
