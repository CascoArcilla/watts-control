const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const adminOnly = [verifyToken, requireRole(['Administrador'])];

// Only admins can create and list users
router.post('/', ...adminOnly, userController.createUser);
router.get('/', ...adminOnly, userController.getUsers);

// Groups list (for the form checklist) — also admin only
router.get('/groups', ...adminOnly, userController.getGroups);

module.exports = router;
