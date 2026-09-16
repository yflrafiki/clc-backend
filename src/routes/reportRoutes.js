const express = require('express');
const router = express.Router();
const { getReports, createReport } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getReports);
router.post('/', auth, createReport);

module.exports = router;
