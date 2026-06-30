const { Router } = require('express');
const router = Router();
const { getBill } = require('../controllers/billController.js');
const { verifyToken } = require('../middleware/authMiddleware');

const auth = [verifyToken];

router.get('/', ...auth, getBill);

module.exports = router;
