const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

  try {
    // 1. First attempt connecting to local native MongoDB
    console.log(`[MongoDB] Attempting connection to: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.name} at ${conn.connection.host}:${conn.connection.port}`);
    console.log(`🧭 [MongoDB Compass] Open MongoDB Compass and connect to: mongodb://127.0.0.1:27017`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Native service not reachable on 27017: ${error.message}`);
    console.log(`[MongoDB] Initializing persistent local MongoDB instance on port 27017...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.resolve(__dirname, '../data/db');

      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoServerInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath,
          storageEngine: 'wiredTiger',
          dbName: 'campusconnect',
        },
      });

      const serverUri = mongoServerInstance.getUri('campusconnect');
      console.log(`[MongoDB] Local engine running at ${serverUri}`);

      const conn = await mongoose.connect(serverUri);
      console.log(`✅ [MongoDB] Connected to persistent database at ${conn.connection.host}:${conn.connection.port}`);
      console.log(`🧭 [MongoDB Compass] You can now connect via Compass at: mongodb://127.0.0.1:27017`);
      return conn;
    } catch (fallbackError) {
      console.error(`❌ [MongoDB Error] Fallback engine failed:`, fallbackError.message);
      return null;
    }
  }
};

module.exports = connectDB;

