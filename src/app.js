const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const titheRoutes = require('./routes/titheRoutes');
const welfareRoutes = require('./routes/welfareRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/tithes', titheRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('Church RMS API Running');
});

module.exports = app;