import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dailyChallengeRoutes from './routes/dailyChallengeRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);

import Settings from './models/Settings.js';

app.get('/api/settings/public', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      platformName: settings.platformName || 'MockMate AI',
      logoUrl: settings.logoUrl || '',
      registrationsEnabled: settings.registrationsEnabled,
      maintenanceMode: settings.maintenanceMode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MockMate AI — Interview Practice Platform API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
