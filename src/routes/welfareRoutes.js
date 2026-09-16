const express = require('express');
const router = express.Router();
const { getContributions, createContribution, getPaidMembers } = require('../controllers/welfareController');

router.get('/', getContributions);
router.post('/', createContribution);
router.get('/paid-members', getPaidMembers);

module.exports = router;
