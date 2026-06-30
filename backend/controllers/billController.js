const { Op } = require('sequelize');
const { getUtcBounds, getAccessibleMeterIds } = require("./mesureController");
const { Meter, Measure, User } = require('../models');

exports.getBill = async (req, res) => {
  try {
    const { meterId, startDate, endDate } = req.query;

    if (!meterId) return res.status(400).json({ error: 'No se proporciono el id del medidor.' });

    if (!startDate) return res.status(400).json({ error: 'No se proporciono fecha de inicio.' });

    if (!endDate) return res.status(400).json({ error: 'No se proporciono fecha final.' });

    if (endDate < startDate) return res.status(400).json({ error: 'La fecha final debe ser mayor a la inicial.' });

    const accessibleMeterIds = await getAccessibleMeterIds(req.userId, req.userGroups);

    const where = {};

    // Filter by specific meter
    if (accessibleMeterIds !== null && !accessibleMeterIds.includes(parseInt(meterId))) {
      return res.status(403).json({ error: 'No tienes acceso a este medidor' });
    }
    where.meterId = meterId;

    const { start } = getUtcBounds(startDate);
    const { end } = getUtcBounds(endDate);
    where.createdAt = { [Op.between]: [start, end] };

    const moreRecentMesure = await Measure.findOne({
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
      order: [['createdAt', 'DESC']]
    });

    const moreOldMesure = await Measure.findOne({
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
      order: [['createdAt', 'ASC']]
    });

    if (!moreOldMesure || !moreRecentMesure) {
      return res.status(404).json({ error: 'No se encontraron medidas en el periodo indicado' });
    }

    if (moreRecentMesure.watts < moreOldMesure.watts) {
      return res.status(500).json({
        error: 'Al parecer las medidas estan desfasadas, la medida reciente debe ser mayor a la medida mas antigua de las fechas dadas.',
        old: moreOldMesure,
        recent: moreRecentMesure,
        difference: moreRecentMesure.watts - moreOldMesure.watts
      });
    }

    if (moreRecentMesure.watts == moreOldMesure.watts) {
      return res.status(404).json({
        error: 'Las medidas son las mismas, no hay consumo en el periodo indicado',
        oldMesure: moreOldMesure.watts,
        recentMesure: moreRecentMesure.watts
      });
    }

    let totalConsumition = moreRecentMesure.watts - moreOldMesure.watts;

    const responseJson = {
      start: startDate,
      end: endDate,
      oldMesure: moreOldMesure,
      recentMesure: moreRecentMesure,
      consumption: totalConsumition,
      meter: moreOldMesure.meter
    };

    res.json(responseJson);
  } catch (error) {
    console.error('getMeasures error:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};