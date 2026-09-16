const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/', auth, role(2), markAttendance);

module.exports = router;
