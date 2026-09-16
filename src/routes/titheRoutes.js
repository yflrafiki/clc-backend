const express = require('express');
const router = express.Router();
const { getTithes, createTithe, getPaidMembers } = require('../controllers/titheController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(1, 3), getTithes);
router.post('/', auth, role(3), createTithe);
router.get('/paid-members', auth, role(1, 3), getPaidMembers);

module.exports = router;
