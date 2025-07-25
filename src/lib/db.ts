import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 在全局对象上缓存连接，避免在开发模式下重复连接
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('请在环境变量中设置 MONGODB_URI');
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // 如果已经连接，直接返回连接
  if (cached.conn) {
    return cached.conn;
  }

  // 如果没有连接promise，创建一个新的连接
  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // 连接池最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时时间
      socketTimeoutMS: 45000, // Socket超时时间
      family: 4, // 使用IPv4
    };

    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
      console.log('✅ MongoDB 连接成功');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB 连接失败:', error);
      // 清除失败的promise，允许重试
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// 连接状态监听
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose 已连接到 MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose 已断开连接');
});

// 优雅关闭连接
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Mongoose 连接已优雅关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 关闭 Mongoose 连接时出错:', error);
    process.exit(1);
  }
});

export default connectDB;
