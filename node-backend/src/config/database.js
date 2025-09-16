const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB连接选项
    const options = {
      maxPoolSize: 10, // 最大连接池大小
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket超时
      bufferCommands: false, // 禁用mongoose缓冲命令
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 MongoDB disconnected');
      // 尝试重连
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;