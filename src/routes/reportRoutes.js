const express = require('express');
const router = express.Router();
const { getReports, createReport } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(1), getReports);
router.post('/', auth, role(1, 4), createReport);

module.exports = router;
