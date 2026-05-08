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

// Update user data — admin only
router.patch('/:id', ...adminOnly, userController.updateUser);

// Update user groups — admin only
router.put('/:id/groups', ...adminOnly, userController.updateUserGroups);

// Block/unblock user — admin only
router.put('/:id/block', ...adminOnly, userController.blockUser);

module.exports = router;
