import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('请在 .env 文件中设置 MONGODB_URI 环境变量');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB 连接成功');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB 连接失败:', e);
    throw e;
  }
}

export default connectToDatabase;
