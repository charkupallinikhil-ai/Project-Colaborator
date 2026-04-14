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
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing data...');
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Data cleared\n');

    console.log('📝 Creating demo users...');
    const createdUsers = await User.insertMany([
      { name: 'Alice Johnson', email: 'alice@example.com', password: await bcrypt.hash('password123', 10), role: 'Student' },
      { name: 'Bob Smith',     email: 'bob@example.com',   password: await bcrypt.hash('password123', 10), role: 'Leader' },
      { name: 'Charlie Brown', email: 'charlie@example.com', password: await bcrypt.hash('password123', 10), role: 'Teacher' },
    ]);
    console.log('✅ Demo users created!\n');

    const [alice, bob, charlie] = createdUsers;

    console.log('📁 Creating demo projects...');
    const createdProjects = await Project.insertMany([
      {
        name: 'Web Development Project',
        description: 'Build a responsive website for the college library',
        joinCode: 'WEB001',
        createdBy: bob._id,
        leader: bob._id,
        members: [alice._id, bob._id],
      },
      {
        name: 'Mobile App Development',
        description: 'Create a student attendance tracking app',
        joinCode: 'MOB002',
        createdBy: charlie._id,
        leader: charlie._id,
        members: [alice._id, charlie._id],
      },
    ]);
    console.log('✅ Demo projects created!\n');
    console.log(`   Project 1 Join Code: WEB001`);
    console.log(`   Project 2 Join Code: MOB002\n`);

    console.log('📋 Creating demo tasks...');
    await Task.insertMany([
      {
        title: 'Design homepage layout',
        description: 'Create a modern, responsive homepage design',
        assignedTo: alice._id,
        projectId: createdProjects[0]._id,
        status: 'In Progress',
        points: 3,
      },
      {
        title: 'Implement user authentication',
        description: 'Set up JWT-based login and register flow',
        assignedTo: alice._id,
        projectId: createdProjects[0]._id,
        status: 'Submitted',
        submissionLink: 'https://github.com/alice/auth-module',
        points: 5,
      },
      {
        title: 'Create wireframes for mobile app',
        description: 'Figma wireframes for all main screens',
        assignedTo: alice._id,
        projectId: createdProjects[1]._id,
        status: 'Approved',
        isApproved: true,
        submissionLink: 'https://figma.com/alice/wireframes',
        points: 2,
      },
    ]);
    console.log('✅ Demo tasks created!\n');

    console.log('═══════════════════════════════════════════════');
    console.log('📌 Demo Credentials:');
    console.log('═══════════════════════════════════════════════');
    console.log('  🎓 Student: alice@example.com  / password123');
    console.log('  🏆 Leader:  bob@example.com    / password123');
    console.log('  👩‍🏫 Teacher: charlie@example.com / password123');
    console.log('───────────────────────────────────────────────');
    console.log('  🔑 Project Join Codes:');
    console.log('     Web Development: WEB001');
    console.log('     Mobile App:      MOB002');
    console.log('═══════════════════════════════════════════════\n');

    mongoose.connection.close();
    console.log('✅ Seed complete! Open http://localhost:5173 to get started.\n');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
