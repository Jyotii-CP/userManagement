// src/controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // don't send password back
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'createdAt'] });
    res.json(users);
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: ['id', 'name', 'email', 'createdAt'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ id: user.id, name: user.name, email: user.email, updatedAt: user.updatedAt });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};