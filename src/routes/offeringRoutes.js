const express = require('express');
const router = express.Router();
const { getOfferings, createOffering, getOfferingSummary } = require('../controllers/offeringController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(1, 3), getOfferings);
router.post('/', auth, role(3), createOffering);
router.get('/summary', auth, role(1, 3), getOfferingSummary);

module.exports = router;
