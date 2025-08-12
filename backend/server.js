require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://192.168.1.100:8081'], // Add your frontend URLs
  credentials: true
}));

app.use(express.json());

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!', port: PORT });
});

app.use('/api', authRoutes);
app.use('/api', chatRoutes);

mongoose.connect(process.env.EXPO_PUBLIC_MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on:`);
      console.log(`   Local:    http://localhost:${PORT}`);
      console.log(`   Network:  http://0.0.0.0:${PORT}`);
      console.log(`   Health:   http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });