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

    // Consumption of the current month
    const now = new Date();
    // Setting dates for local month, can adjust if strict UTC is needed
    const firstDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const nextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));

    const totalConsumption = await Measure.sum('watts', {
      where: {
        createdAt: {
          [Op.gte]: firstDayOfMonth,
          [Op.lt]: nextMonth
        }
      }
    });

    // Consumption by meter for current month
    const consumptionByMeter = await Measure.findAll({
      attributes: [
        'meterId',
        [sequelize.fn('sum', sequelize.col('watts')), 'totalWatts']
      ],
      where: {
        createdAt: {
          [Op.gte]: firstDayOfMonth,
          [Op.lt]: nextMonth
        }
      },
      include: [{
        model: Meter,
        attributes: ['number_meter']
      }],
      group: ['meterId', 'Meter.id']
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
        byMeterCurrentMonth: consumptionByMeter.map(item => ({
          meterId: item.meterId,
          meterNumber: item.Meter ? item.Meter.number_meter : 'N/A',
          totalWatts: parseInt(item.get('totalWatts'), 10) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};
