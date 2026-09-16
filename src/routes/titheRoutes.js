const express = require('express');
const router = express.Router();
const { getTithes, createTithe, getPaidMembers } = require('../controllers/titheController');

router.get('/', getTithes);
router.post('/', createTithe);
router.get('/paid-members', getPaidMembers);

module.exports = router;
