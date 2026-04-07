const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-collab';
  
  try {
    console.log('📡 Connecting to MongoDB...');
    console.log(`   ${uri.includes('mongodb+srv') ? '☁️  Cloud' : '💻 Local'} MongoDB`);
    
    await mongoose.connect(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:');
    console.error(`   ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
