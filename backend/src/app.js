const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check routes for UptimeRobot / monitoring (keeps Render awake)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).send('CryptX Backend is Running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

module.exports = app;
