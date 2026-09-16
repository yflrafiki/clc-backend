const express = require('express');
const router = express.Router();
const { getOfferings, createOffering, getOfferingSummary } = require('../controllers/offeringController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getOfferings);
router.post('/', auth, createOffering);
router.get('/summary', auth, getOfferingSummary);

module.exports = router;
