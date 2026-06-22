const express = require('express');
const router = express.Router();
const { getTithes, createTithe } = require('../controllers/titheController');

router.get('/', getTithes);
router.post('/', createTithe);

module.exports = router;
