const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getFinancialSummary, getReceipts, uploadReceipt } = require('../controllers/accountController');
const auth = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads', 'receipts')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/summary', auth, getFinancialSummary);
router.get('/receipts', auth, getReceipts);
router.post('/receipts', auth, upload.single('receipt_image'), uploadReceipt);

module.exports = router;
