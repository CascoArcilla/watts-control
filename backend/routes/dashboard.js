const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const adminOnly = [verifyToken, requireRole(['Administrador'])];

// Only admins can access dashboard stats
router.get('/stats', ...adminOnly, dashboardController.getDashboardStats);

module.exports = router;
