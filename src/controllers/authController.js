const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLE_LABELS = {
  1: 'Admin',
  2: 'Members Dept',
  3: 'Finance Dept',
  4: 'Assistant'
};

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
      },
    });

  } catch (error) {

    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {

  try {

    const {
      full_name,
      email,
      password
    } = req.body;

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role_id: 2
    });

    res.status(201).json({
      message: 'Account created successfully',
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

const createAccount = async (req, res) => {
  try {
    const { full_name, email, password, role_id } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    const numericRoleId = Number(role_id);
    const allowedRoles = req.user?.role_id === 1 ? [1, 2, 3, 4] : [2, 3, 4];

    if (!allowedRoles.includes(numericRoleId)) {
      return res.status(403).json({
        message: 'You are not allowed to assign this role'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role_id: numericRoleId
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        role_label: ROLE_LABELS[user.role_id] || 'User'
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to create account' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role_id'],
      order: [['role_id', 'ASC'], ['full_name', 'ASC']],
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      role_label: ROLE_LABELS[user.role_id] || 'User',
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, role_id } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const numericRoleId = Number(role_id);
    const allowedRoles = req.user?.role_id === 1 ? [1, 2, 3, 4] : [2, 3, 4];

    if (!allowedRoles.includes(numericRoleId)) {
      return res.status(403).json({ message: 'You are not allowed to assign this role' });
    }

    if (user.id === req.user.id && numericRoleId !== user.role_id && req.user.role_id !== 1) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await user.update({
      full_name: full_name || user.full_name,
      email: email || user.email,
      role_id: numericRoleId || user.role_id,
    });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (Number(userId) === Number(req.user.id)) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  login,
  register,
  createAccount,
  getUsers,
  updateUser,
  deleteUser
};