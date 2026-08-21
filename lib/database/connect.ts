import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseConnection;
};

const cached = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongoose = cached;

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL) {
    throw new Error("Missing MONGODB_URL in .env.local");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "aku",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};