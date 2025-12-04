import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(async (mongoose) => {
      // --- FIX: Remove the conflicting index ---
      try {
        const usersCollection = mongoose.connection.collection('users');
        // Check if index exists before dropping
        const indexExists = await usersCollection.indexExists('discordId_1');
        if (indexExists) {
          console.log('Fixing Database: Dropping old discordId index...');
          await usersCollection.dropIndex('discordId_1');
          console.log('Database Fixed.');
        }
      } catch (e) {
        // Ignore error if index is already gone
        console.log('Index cleanup check passed.');
      }
      // ----------------------------------------
      
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;