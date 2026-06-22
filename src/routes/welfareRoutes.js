const express = require('express');
const router = express.Router();
const { getContributions, createContribution } = require('../controllers/welfareController');

router.get('/', getContributions);
router.post('/', createContribution);

module.exports = router;
