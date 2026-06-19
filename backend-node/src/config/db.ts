import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_db';
    
    // Try connecting to the configured MongoDB URI first
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if no server
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Could not connect to MongoDB at configured URI. Falling back to in-memory MongoDB...`);
    
    try {
      // Dynamically import mongodb-memory-server for dev/test fallback
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`⚠️  Data will be lost when the server stops!`);
    } catch (memError) {
      console.error(`Failed to start in-memory MongoDB: ${(memError as Error).message}`);
      console.error(`Please install MongoDB or set MONGO_URI to a MongoDB Atlas connection string.`);
      process.exit(1);
    }
  }
};

export default connectDB;
