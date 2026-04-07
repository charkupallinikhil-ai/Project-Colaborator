require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`   URI: ${process.env.MONGO_URI || 'mongodb://localhost:27017/student-collab'}`);
    
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing data...');
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Data cleared\n');

    console.log('📝 Creating demo users...');
    const users = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Student',
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Leader',
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Teacher',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Demo users created successfully!\n');

    console.log('📁 Creating demo projects...');
    const projects = [
      {
        name: 'Web Development Project',
        description: 'Build a responsive website for the college library',
        leader: createdUsers[1]._id, // Bob (Leader)
        members: [createdUsers[0]._id, createdUsers[1]._id], // Alice and Bob
      },
      {
        name: 'Mobile App Development',
        description: 'Create a student attendance tracking app',
        leader: createdUsers[1]._id, // Bob (Leader)
        members: [createdUsers[0]._id], // Alice
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('✅ Demo projects created successfully!\n');

    console.log('📋 Creating demo tasks...');
    const tasks = [
      {
        title: 'Design homepage layout',
        assignedTo: createdUsers[0]._id, // Alice
        projectId: createdProjects[0]._id, // Web Development Project
        status: 'In Progress',
        points: 3,
      },
      {
        title: 'Implement user authentication',
        assignedTo: createdUsers[0]._id, // Alice
        projectId: createdProjects[0]._id, // Web Development Project
        status: 'Pending',
        points: 5,
      },
      {
        title: 'Create wireframes for mobile app',
        assignedTo: createdUsers[0]._id, // Alice
        projectId: createdProjects[1]._id, // Mobile App Project
        status: 'Done',
        points: 2,
      },
    ];

    await Task.insertMany(tasks);
    console.log('✅ Demo tasks created successfully!\n');
    
    console.log('═══════════════════════════════════════════');
    console.log('📌 Demo Credentials:');
    console.log('═══════════════════════════════════════════');
    console.log('  👤 Student: alice@example.com / password123');
    console.log('  👤 Leader:  bob@example.com / password123');
    console.log('  👤 Teacher: charlie@example.com / password123');
    console.log('═══════════════════════════════════════════\n');

    mongoose.connection.close();
    console.log('✅ Done! You can now login and start assigning tasks.');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure MongoDB is running (mongod)');
    console.error('  2. Check MONGO_URI in .env');
    console.error('  3. Check backend/.env exists with correct values');
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
