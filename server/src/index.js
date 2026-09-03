require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes       = require('./routes/auth');
const directionsRoutes = require('./routes/directions');
const applicationsRoutes = require('./routes/applications');
const funnelRoutes     = require('./routes/funnel');
const statsRoutes      = require('./routes/stats');
const generateRoutes   = require('./routes/generate');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rate limiting for generate endpoint
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  message: { error: 'Слишком много запросов, попробуйте позже' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/directions',   directionsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/funnel',       funnelRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/generate',     generateLimiter, generateRoutes);

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
