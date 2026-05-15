const { User, Meter, Measure, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    // Users stats
    const totalUsers = await User.count();
    const blockedUsers = await User.count({ where: { is_bloked: true } });
    const activeUsers = totalUsers - blockedUsers;

    const usersWithPassword = await User.count({ where: { use_password: true } });
    const usersWithoutPassword = totalUsers - usersWithPassword;

    // Meters stats
    const totalMeters = await Meter.count();
    const activeMeters = await Meter.count({ where: { status_meter: 'active' } });
    const inactiveMeters = totalMeters - activeMeters;

    // Consumption of the current month based on client date
    const clientDateString = req.query.date || new Date().toDateString();
    const clientDate = new Date(clientDateString);

    // Calculate the start and end of the month based on client's local time,
    // Sequelize will handle the conversion to UTC for the database query.
    const firstDayOfMonth = new Date(clientDate.getFullYear(), clientDate.getMonth(), 1);
    const nextMonth = new Date(clientDate.getFullYear(), clientDate.getMonth() + 1, 1);

    // Get all active meters to calculate their consumption
    const allActiveMeters = await Meter.findAll({
      where: { status_meter: 'active' },
      attributes: ['id', 'number_meter']
    });

    const metersConsumption = await Promise.all(allActiveMeters.map(async (meter) => {
      // Find the most recent measure in the current month
      const latestMeasureThisMonth = await Measure.findOne({
        where: {
          meterId: meter.id,
          createdAt: {
            [Op.gte]: firstDayOfMonth,
            [Op.lt]: nextMonth
          }
        },
        order: [['createdAt', 'DESC']]
      });

      // Find the most recent measure before the current month
      const latestMeasurePrevious = await Measure.findOne({
        where: {
          meterId: meter.id,
          createdAt: {
            [Op.lt]: firstDayOfMonth
          }
        },
        order: [['createdAt', 'DESC']]
      });

      let consumptionWatts = 0;
      let hasNoPreviousRecord = false;
      let hasNoCurrentRecord = false;

      if (latestMeasureThisMonth) {
        if (latestMeasurePrevious) {
          consumptionWatts = latestMeasureThisMonth.watts - latestMeasurePrevious.watts;
        } else {
          consumptionWatts = latestMeasureThisMonth.watts;
          hasNoPreviousRecord = true;
        }
      } else {
        hasNoCurrentRecord = true;
        consumptionWatts = 0;
      }

      return {
        meterId: meter.id,
        meterNumber: meter.number_meter,
        totalWatts: Math.max(0, consumptionWatts), // Ensure no negative consumption if data is weird
        hasNoPreviousRecord,
        hasNoCurrentRecord
      };
    }));

    // Filter to only include meters that have readings this month
    const consumptionByMeter = metersConsumption.filter(m => !m.hasNoCurrentRecord);

    let totalConsumption = 0;
    let anyMeterMissingPrevious = false;

    consumptionByMeter.forEach(m => {
      totalConsumption += m.totalWatts;
      if (m.hasNoPreviousRecord) {
        anyMeterMissingPrevious = true;
      }
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        withPassword: usersWithPassword,
        withoutPassword: usersWithoutPassword
      },
      meters: {
        total: totalMeters,
        active: activeMeters,
        inactive: inactiveMeters
      },
      consumption: {
        totalCurrentMonth: totalConsumption || 0,
        anyMeterMissingPrevious: anyMeterMissingPrevious,
        byMeterCurrentMonth: consumptionByMeter.map(item => ({
          meterId: item.meterId,
          meterNumber: item.meterNumber || 'N/A',
          totalWatts: item.totalWatts || 0,
          hasNoPreviousRecord: item.hasNoPreviousRecord
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};
