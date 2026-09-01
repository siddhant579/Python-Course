const mongoose = require('mongoose');

// Serverless (Vercel) reuses a warm container across invocations, so we cache
// the connection on the global object and never call process.exit() - a failed
// connection must surface as a normal error the request handler can report,
// not kill the whole function.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set (add it in the Vercel project env vars)');
    }

    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
  } catch (err) {
    cached.promise = null; // let the next request retry
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }

  return cached.conn;
}

module.exports = connectDB;
