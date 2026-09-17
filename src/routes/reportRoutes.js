const express = require('express');
const router = express.Router();
const { getReports, getMemberReport, getMemberReportBySearch, createReport } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(1), getReports);
router.get('/member-search', auth, role(1, 2, 3), getMemberReportBySearch);
router.get('/member/:memberId', auth, role(1, 2, 3), getMemberReport);
router.post('/', auth, role(1, 4), createReport);

module.exports = router;
