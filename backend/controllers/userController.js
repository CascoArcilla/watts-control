const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User, Group } = require('../models');
const passwordRegex = require('../consts/regexPassword');
const usernameRegex = require('../consts/regexUsername');

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, username, password, use_password, groups } = req.body;

    // Validations
    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'El nombre de usuario es obligatorio.' });
    }
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Formato de nombre de usuario inválido.' });
    }

    // Check duplicate username
    const existing = await User.findOne({ where: { username: username.trim() } });
    if (existing) {
      return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
    }

    let hashedPassword = null;
    if (use_password) {
      if (!password || !password.trim()) {
        return res.status(400).json({ message: 'La contraseña es obligatoria cuando use_password está activo.' });
      }
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Formato de contraseña inválido.' });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
      first_name: first_name.trim(),
      last_name: last_name ? last_name.trim() : null,
      username: username.trim(),
      password: hashedPassword,
      use_password: !!use_password,
      is_bloked: false,
    });

    // Assign groups if provided
    if (groups && groups.length > 0) {
      const groupRecords = await Group.findAll({ where: { id: { [Op.in]: groups } } });
      await user.setGroups(groupRecords);
    }

    // Reload with groups
    const userWithGroups = await User.findByPk(user.id, {
      include: [{ model: Group }],
      attributes: { exclude: ['password'] }
    });

    return res.status(201).json({
      message: 'Usuario creado exitosamente.',
      user: userWithGroups
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/users?page=1&limit=10
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      include: [{ model: Group, through: { attributes: [] } }],
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      }
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/users/groups  -- for the form checklist
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({ order: [['name', 'ASC']] });
    return res.json({ groups });
  } catch (error) {
    console.error('getGroups error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
