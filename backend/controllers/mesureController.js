const { Op } = require('sequelize');
const { Meter, Measure, User, Group } = require('../models');

/**
 * Calculates the UTC start and end of a local date string
 * @param {Date} dateClient Date in local format
 * @param {Integer} offsetMs Timezone offset in milliseconds
 * @returns {{start: string, end: string}}
 */
const getUtcBounds = (dateClient) => {
  const utcStart = new Date(dateClient);
  const utcEnd = new Date(utcStart.getTime() + (24 * 60 * 60 * 1000) - 1);
  return {
    start: utcStart.toISOString(),
    end: utcEnd.toISOString()
  };
}

// Helper to get accessible meter IDs for a user
const getAccessibleMeterIds = async (userId, userGroups) => {
  const isAdmin = userGroups.includes('Administrador');
  const isLector = userGroups.includes('Lector');
  const isPropietario = userGroups.includes('Propietario');

  if (isAdmin) return null; // null means all

  const meterIds = new Set();

  if (isPropietario) {
    const owned = await Meter.findAll({ where: { userId }, attributes: ['id'] });
    owned.forEach(m => meterIds.add(m.id));
  }

  if (isLector || isPropietario) {
    const user = await User.findByPk(userId, {
      include: [{ model: Meter, as: 'AuthorizedMeters', attributes: ['id'] }]
    });
    if (user && user.AuthorizedMeters) {
      user.AuthorizedMeters.forEach(m => meterIds.add(m.id));
    }
  }

  return Array.from(meterIds);
};

exports.getMeasures = async (req, res) => {
  try {
    const { page = 1, limit = 10, meterId, date, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const accessibleMeterIds = await getAccessibleMeterIds(req.userId, req.userGroups);

    const where = {};

    // Filter by accessibility
    if (accessibleMeterIds !== null) {
      where.meterId = { [Op.in]: accessibleMeterIds };
    }

    // Filter by specific meter if requested
    if (meterId) {
      if (accessibleMeterIds !== null && !accessibleMeterIds.includes(parseInt(meterId))) {
        return res.status(403).json({ message: 'No tienes acceso a este medidor.' });
      }
      where.meterId = meterId;
    }

    // Filter by date
    if (date) {
      const { start, end } = getUtcBounds(date);
      where.createdAt = { [Op.between]: [start, end] };
    } else if (startDate && endDate) {
      const { start } = getUtcBounds(startDate);
      const { end } = getUtcBounds(endDate);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const { count, rows } = await Measure.findAndCountAll({
      where,
      include: [
        {
          model: Meter,
          attributes: ['number_meter', 'userId'],
          include: [{ model: User, attributes: ['username', 'first_name', 'last_name'] }]
        },
        {
          model: User,
          attributes: ['first_name', 'last_name', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const responseJson = {
      measures: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };

    // Calculate the meter's consumption from the indicate date
    if (date && meterId) {
      const kwhToday = parseInt(rows[0]?.watts) || null;

      const { start: startDayUtc } = getUtcBounds(date);
      // Find the more recent measure before the indicate date
      const lastMeasure = await Measure.findOne({
        where: {
          meterId,
          createdAt: { [Op.lt]: startDayUtc }
        },
        order: [['createdAt', 'DESC']]
      });

      if (kwhToday && lastMeasure) {
        const consumption = parseInt(kwhToday) - parseInt(lastMeasure.watts);
        responseJson.consumption = {
          kwh: consumption,
          referenceDate: lastMeasure?.createdAt || null,
          referenceKwh: lastMeasure?.watts || null
        }
      }
    }

    res.json(responseJson);
  } catch (error) {
    console.error('getMeasures error:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.register = async (request, response) => {
  try {
    const { meter, watts } = request.body;

    if (!meter || !watts) {
      return response.status(400).json({
        message: 'Medidor y consumo son obligatorios.',
        success: false
      });
    }

    const parsedWatts = parseInt(watts);
    if (isNaN(parsedWatts) || parsedWatts < 0) {
      return response.status(400).json({
        message: 'Consumo debe ser un número mayor o igual a 0.',
        success: false
      });
    }

    const currentUser = await User.findByPk(request.userId);
    if (!currentUser) {
      return response.status(404).json({
        message: 'Usuario no encontrado.',
        success: false
      });
    }

    const meterFound = await Meter.findOne({
      where: { id: meter.id },
      include: [{ model: User, as: 'AuthorizedUsers' }]
    });

    if (!meterFound) {
      return response.status(404).json({
        message: 'Medidor no encontrado.',
        success: false
      });
    }

    const userGroups = request.userGroups;
    const isAdmin = userGroups.includes('Administrador');
    const isProvider = meterFound.userId === currentUser.id;
    const isAuthorized = meterFound.AuthorizedUsers.some(user => user.id === currentUser.id);
    if (!isAdmin && !isProvider && !isAuthorized) {
      return response.status(403).json({
        message: 'No tienes permiso para registrar consumo en este medidor.',
        success: false
      });
    }

    const previusMeasure = await Measure.findOne({
      where: { meterId: meterFound.id },
      order: [['createdAt', 'DESC']]
    });

    if (previusMeasure && previusMeasure.watts > watts) {
      return response.status(400).json({
        message: 'El consumo no puede ser menor al anterior.',
        success: false
      });
    }

    const consumption = await Measure.create({
      userId: currentUser.id,
      meterId: meterFound.id,
      watts: parsedWatts
    });

    return response.status(201).json({
      message: 'Consumo registrado exitosamente.',
      success: true,
      consumption
    });
  } catch (error) {
    console.error('Error al registrar el consumo:', error);
    return response.status(500).json({
      message: 'Error al registrar el consumo.',
      success: false
    });
  }
}

exports.getUtcBounds = getUtcBounds;