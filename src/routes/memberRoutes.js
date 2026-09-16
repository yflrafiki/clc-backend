const express = require('express');
const router = express.Router();
const { getMembers, createMember } = require('../controllers/memberController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Admin(1) + Members dept(2) can add members
// Finance dept(3) can read members for dropdowns
router.get('/', auth, role(1, 2, 3), getMembers);
router.post('/', auth, role(2), createMember);

module.exports = router;
