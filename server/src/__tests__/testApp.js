require('dotenv').config({ path: require('path').join(__dirname, '../../.env.test') });

const express = require('express');
const cors    = require('cors');

const authRoutes         = require('../routes/auth');
const directionsRoutes   = require('../routes/directions');
const applicationsRoutes = require('../routes/applications');
const funnelRoutes       = require('../routes/funnel');
const statsRoutes        = require('../routes/stats');
const generateRoutes     = require('../routes/generate');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/directions',   directionsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/funnel',       funnelRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/generate',     generateRoutes);

module.exports = app;
