const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  markAttendance, getServices, selfCheckIn, visitorCheckIn, getToday
} = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Generous limit: many members share the church Wi-Fi, so they share one IP
const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many check-in attempts. Please wait a few minutes or see the front desk.' },
});

// Public QR check-in (no login)
router.get('/services', getServices);
router.post('/checkin', checkInLimiter, selfCheckIn);
router.post('/visitor', checkInLimiter, visitorCheckIn);

// Front desk
router.get('/today', auth, role(1, 2), getToday);
router.post('/', auth, role(2), markAttendance);

module.exports = router;
