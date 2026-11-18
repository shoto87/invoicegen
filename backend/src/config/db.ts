import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    console.log(`[DB] Attempting MongoDB connection: ${env.MONGODB_URI}`);
    
    // Connect with a 5 second server selection timeout
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] Successfully connected to MongoDB.');
  } catch (err: any) {
    console.warn(`[DB] Primary MongoDB connection failed (${err.message}).`);
    
    if (env.USE_MEMORY_DB_FALLBACK) {
      console.log('[DB] Initializing embedded in-memory MongoDB for local development/testing...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[DB] Connected to In-Memory MongoDB successfully: ${memoryUri}`);
        return;
      } catch (memErr: any) {
        console.error('[DB] Failed to start in-memory MongoDB fallback:', memErr);
      }
    }
    
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
