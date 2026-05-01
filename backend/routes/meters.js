const express = require('express');
const router = express.Router();
const mc = require('../controllers/meterController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const adminOnly  = [verifyToken, requireRole(['Administrador'])];
const authUsers  = [verifyToken];

// Owner search — admin only (for Register form)
router.get('/owners', ...adminOnly, mc.getOwners);

// Candidate authorized users — admin only (Lector + Propietario)
router.get('/candidates', ...adminOnly, mc.getCandidates);

// Create meter — admin only
router.post('/', ...adminOnly, mc.createMeter);

// List meters — any authenticated user (filtered by role inside controller)
router.get('/', ...authUsers, mc.getMeters);

// Authorized users for a meter — admin only
router.get('/:id/authorized', ...adminOnly, mc.getAuthorized);
router.put('/:id/authorized', ...adminOnly, mc.setAuthorized);

module.exports = router;
