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
      { name: 'Student User', email: 'student@college.edu', password: await bcrypt.hash('Student@123', 10), role: 'Student' },
      { name: 'Leader User',  email: 'leader@college.edu',  password: await bcrypt.hash('Leader@123', 10), role: 'Leader' },
      { name: 'Teacher User', email: 'teacher@college.edu', password: await bcrypt.hash('Teacher@123', 10), role: 'Teacher' },
      { name: 'Design Student', email: 'designer@college.edu', password: await bcrypt.hash('Design@123', 10), role: 'Student' },
    ]);
    console.log('✅ Demo users created!\n');

    const [student, leader, teacher, designer] = createdUsers;

    console.log('📁 Creating demo projects...');
    const createdProjects = await Project.insertMany([
      {
        name: 'Web Development Project',
        description: 'Build a responsive website for the college library',
        joinCode: 'WEB001',
        createdBy: leader._id,
        leader: leader._id,
        members: [student._id, designer._id, leader._id],
      },
      {
        name: 'Mobile App Development',
        description: 'Create a student attendance tracking app',
        joinCode: 'MOB002',
        createdBy: teacher._id,
        leader: teacher._id,
        members: [student._id, teacher._id],
      },
      {
        name: 'Marketing Campaign',
        description: 'Plan and execute a campus event promotion',
        joinCode: 'MKT003',
        createdBy: leader._id,
        leader: leader._id,
        members: [student._id, designer._id, leader._id],
      },
    ]);
    console.log('✅ Demo projects created!\n');
    console.log(`   Project 1 Join Code: WEB001`);
    console.log(`   Project 2 Join Code: MOB002`);
    console.log(`   Project 3 Join Code: MKT003\n`);

    console.log('📋 Creating demo tasks...');
    await Task.insertMany([
      {
        title: 'Design homepage layout',
        description: 'Create a modern, responsive homepage design',
        assignedTo: designer._id,
        projectId: createdProjects[0]._id,
        status: 'In Progress',
        points: 3,
      },
      {
        title: 'Implement user authentication',
        description: 'Set up JWT-based login and register flow',
        assignedTo: student._id,
        projectId: createdProjects[0]._id,
        status: 'Submitted',
        submissionLink: 'https://github.com/student/auth-module',
        points: 5,
      },
      {
        title: 'Create wireframes for mobile app',
        description: 'Figma wireframes for all main screens',
        assignedTo: student._id,
        projectId: createdProjects[1]._id,
        status: 'Approved',
        isApproved: true,
        submissionLink: 'https://figma.com/student/wireframes',
        points: 2,
      },
      {
        title: 'Draft event social posts',
        description: 'Prepare copy and visuals for the campus launch week campaign',
        assignedTo: designer._id,
        projectId: createdProjects[2]._id,
        status: 'Pending',
        points: 2,
      },
      {
        title: 'Collect participant feedback',
        description: 'Survey students after the marketing event',
        assignedTo: student._id,
        projectId: createdProjects[2]._id,
        status: 'Pending',
        points: 3,
      },
    ]);
    console.log('✅ Demo tasks created!\n');

    console.log('═══════════════════════════════════════════════');
    console.log('📌 Demo Credentials:');
    console.log('═══════════════════════════════════════════════');
    console.log('  🎓 Student: student@college.edu  / Student@123');
    console.log('  🏆 Leader:  leader@college.edu   / Leader@123');
    console.log('  👩‍🏫 Teacher: teacher@college.edu / Teacher@123');
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
