const bcrypt = require('bcryptjs');
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

// PATCH /api/users/:id — update user data (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, change_username, username, change_password, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const updates = {};

    if (first_name !== undefined) {
      if (!first_name.trim()) return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
      updates.first_name = first_name.trim();
    }

    if (last_name !== undefined) {
      updates.last_name = last_name ? last_name.trim() : null;
    }

    if (change_username) {
      if (!username.trim()) return res.status(400).json({ message: 'El nombre de usuario no puede estar vacío.' });
      if (!usernameRegex.test(username)) return res.status(400).json({ message: 'Formato de nombre de usuario inválido.' });

      const duplicate = await User.findOne({ where: { username: username.trim(), id: { [Op.ne]: id } } });
      if (duplicate) return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });

      updates.username = username.trim();
    }

    if (change_password) {
      if (!password || !password.trim()) return res.status(400).json({ message: 'La nueva contraseña es obligatoria.' });
      if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Formato de contraseña inválido.' });
      updates.password = await bcrypt.hash(password, 10);
      updates.use_password = true;
    }

    await user.update(updates);

    const updated = await User.findByPk(id, {
      include: [{ model: Group }],
      attributes: { exclude: ['password'] },
    });

    return res.json({ message: 'Usuario actualizado.', user: updated });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PUT /api/users/:id/groups — replace user groups (admin only)
exports.updateUserGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const { groups } = req.body; // array of group IDs

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const groupRecords = groups && groups.length > 0
      ? await Group.findAll({ where: { id: { [Op.in]: groups } } })
      : [];

    if (groupRecords.length === 0) return res.status(400).json({ message: 'Se requiere al menos un grupo válido.' });

    await user.setGroups(groupRecords);

    const updated = await User.findByPk(id, {
      include: [{ model: Group }],
      attributes: { exclude: ['password'] },
    });

    return res.json({ message: 'Grupos actualizados.', user: updated });
  } catch (error) {
    console.error('updateUserGroups error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PUT /api/users/:id/block — block or unblock a user (admin only)
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });


    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    if (block === undefined) return res.status(400).json({ message: 'Se requiere el campo block.' });
    if (typeof block !== 'boolean') return res.status(400).json({ message: 'El campo block debe ser un booleano.' });
    if (user.id === req.user.id) return res.status(403).json({ message: 'No se puede bloquear al usuario actual.' });

    if (user.is_bloked === block) {
      const message = block ? 'El usuario ya se encuentra bloqueado.' : 'El usuario ya se encuentra desbloqueado.';
      return res.status(400).json({ message });
    }

    await user.update({ is_bloked: block });

    const message = block ? 'Usuario bloqueado correctamente.' : 'Usuario desbloqueado correctamente.';

    return res.json({ message, user });
  } catch (error) {
    console.error('blockUser error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
