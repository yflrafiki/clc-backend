const express = require('express');
const router = express.Router();
const { getContributions, createContribution, getPaidMembers } = require('../controllers/welfareController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(1, 3), getContributions);
router.post('/', auth, role(3), createContribution);
router.get('/paid-members', auth, role(1, 3), getPaidMembers);

module.exports = router;
