require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const contributionRoutes = require('./routes/contributionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/contribution', contributionRoutes);

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Student Project Collaboration Backend...\n');

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('✅ Backend running successfully!');
      console.log(`   🔗 URL: http://localhost:${PORT}`);
      console.log(`   📡 API: http://localhost:${PORT}/api`);
      console.log('\n   Ready to accept connections...\n');
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start backend:');
    console.error(`   ${err.message}`);
    console.error('\nTroubleshooting:');
    console.error('  1. Is MongoDB running? (mongod)');
    console.error('  2. Check MONGO_URI in backend/.env');
    process.exit(1);
  });
