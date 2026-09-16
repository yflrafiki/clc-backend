const express = require('express');
const cors = require('cors');
const path = require('path');

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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/tithes', titheRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/offerings', offeringRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/', (req, res) => {
  res.send('Church RMS API Running');
});

module.exports = app;
