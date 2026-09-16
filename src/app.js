const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const titheRoutes = require('./routes/titheRoutes');
const welfareRoutes = require('./routes/welfareRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const offeringRoutes = require('./routes/offeringRoutes');
const reportRoutes = require('./routes/reportRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin in production
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Serve uploaded receipts
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rate limit auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/tithes', titheRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/offerings', offeringRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/', (req, res) => res.json({ status: 'Church RMS API Running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
  });
});

module.exports = app;
