const { Op } = require('sequelize');
const { Meter, User, Group, Measure } = require('../models');

// GET /api/meters/owners?search=name  — users with 'Propietario' group
exports.getOwners = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';

    const where = search
      ? {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
        ]
      }
      : {};

    const propietarioGroup = await Group.findOne({ where: { name: 'Propietario' } });
    if (!propietarioGroup) {
      return res.json({ owners: [] });
    }

    const owners = await User.findAll({
      where,
      include: [{
        model: Group,
        where: { id: propietarioGroup.id },
        through: { attributes: [] },
        required: true,
      }],
      attributes: ['id', 'first_name', 'last_name', 'username'],
      order: [['first_name', 'ASC']],
      limit: 20,
    });

    return res.json({ owners });
  } catch (error) {
    console.error('getOwners error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// POST /api/meters  — admin only
exports.createMeter = async (req, res) => {
  try {
    const { number_meter, userId, status_meter } = req.body;

    if (!number_meter) {
      return res.status(400).json({ message: 'El número de medidor es obligatorio.' });
    }

    const existing = await Meter.findOne({ where: { number_meter } });
    if (existing) {
      return res.status(409).json({ message: `El número de medidor #${number_meter} ya existe.` });
    }

    const meter = await Meter.create({
      number_meter,
      userId: userId || null,
      status_meter: status_meter || 'active',
    });

    const meterFull = await Meter.findByPk(meter.id, {
      include: [{ model: User, as: undefined, attributes: ['id', 'first_name', 'last_name', 'username'] }],
    });

    return res.status(201).json({ message: 'Medidor creado exitosamente.', meter: meterFull });
  } catch (error) {
    console.error('createMeter error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/meters  — filtered by role
exports.getMeters = async (req, res) => {
  try {
    const userId = req.userId;
    const userGroups = req.userGroups;

    const isAdmin = userGroups.includes('Administrador');
    const isLector = userGroups.includes('Lector');
    const isPropietario = userGroups.includes('Propietario');

    let meters = [];

    if (isAdmin) {
      // Admin: all meters
      meters = await Meter.findAll({
        include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'username'] }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Build a Set of meter IDs to avoid duplicates
      const meterIds = new Set();
      const meterMap = new Map();

      // Propietario: meters owned (userId FK)
      if (isPropietario) {
        const owned = await Meter.findAll({
          where: { userId },
          include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'username'] }],
        });
        owned.forEach(m => { meterIds.add(m.id); meterMap.set(m.id, m); });
      }

      // Lector & Propietario: meters authorized via UserMeters
      if (isLector || isPropietario) {
        const user = await User.findByPk(userId, {
          include: [{
            model: Meter,
            as: 'AuthorizedMeters',
            include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'username'] }],
          }],
        });
        if (user && user.AuthorizedMeters) {
          user.AuthorizedMeters.forEach(m => {
            if (!meterIds.has(m.id)) { meterIds.add(m.id); meterMap.set(m.id, m); }
          });
        }
      }

      meters = Array.from(meterMap.values());
    }

    let resopnseJson = meters;
    const { includeLastMeasure } = req.query;

    if (includeLastMeasure) {
      // Fetch the last measure for each meter
      resopnseJson = await Promise.all(meters.map(async (m) => {
        const lastMeasure = await Measure.findOne({
          where: { meterId: m.id },
          order: [['createdAt', 'DESC']],
          attributes: ['watts', 'createdAt']
        });
        const meterJson = m.toJSON ? m.toJSON() : m;
        return { ...meterJson, lastMeasure };
      }));
    }

    return res.json({ meters: resopnseJson });
  } catch (error) {
    console.error('getMeters error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/meters/:id/authorized  — users in UserMeters for a meter
exports.getAuthorized = async (req, res) => {
  try {
    const meter = await Meter.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'AuthorizedUsers',
        attributes: ['id', 'first_name', 'last_name', 'username'],
        through: { attributes: [] },
      }],
    });
    if (!meter) return res.status(404).json({ message: 'Medidor no encontrado.' });
    return res.json({ meter, authorized: meter.AuthorizedUsers });
  } catch (error) {
    console.error('getAuthorized error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PUT /api/meters/:id/authorized  — replace full authorized list
exports.setAuthorized = async (req, res) => {
  try {
    const { userIds } = req.body; // array of user IDs
    const meter = await Meter.findByPk(req.params.id);
    if (!meter) return res.status(404).json({ message: 'Medidor no encontrado.' });

    const users = userIds && userIds.length > 0
      ? await User.findAll({ where: { id: { [Op.in]: userIds } } })
      : [];

    await meter.setAuthorizedUsers(users);

    return res.json({ message: 'Permisos actualizados.' });
  } catch (error) {
    console.error('setAuthorized error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/meters/candidates?search=  — users eligible to be authorized (Lector OR Propietario)
exports.getCandidates = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';

    const where = search
      ? {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
        ]
      }
      : {};

    const [lectorGroup, propietarioGroup] = await Promise.all([
      Group.findOne({ where: { name: 'Lector' } }),
      Group.findOne({ where: { name: 'Propietario' } }),
    ]);

    const groupIds = [lectorGroup?.id, propietarioGroup?.id].filter(Boolean);
    if (groupIds.length === 0) return res.json({ candidates: [] });

    const candidates = await User.findAll({
      where,
      include: [{
        model: Group,
        where: { id: { [Op.in]: groupIds } },
        through: { attributes: [] },
        required: true,
      }],
      attributes: ['id', 'first_name', 'last_name', 'username'],
      order: [['first_name', 'ASC']],
      limit: 30,
    });

    return res.json({ candidates });
  } catch (error) {
    console.error('getCandidates error:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
