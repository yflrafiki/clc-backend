const express = require('express');

const router = express.Router();

const {
  login,
  register,
  createAccount,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/users', auth, role(1, 4), getUsers);
router.post('/create-account', auth, role(1, 4), createAccount);
router.put('/users/:userId', auth, role(1, 4), updateUser);
router.delete('/users/:userId', auth, role(1, 4), deleteUser);

module.exports = router;