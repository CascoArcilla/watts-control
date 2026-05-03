const { Router } = require('express');
const router = Router();
const mc = require('../controllers/mesureController.js');
const { verifyToken } = require('../middleware/authMiddleware');

const auth = [verifyToken];

router.get('/', ...auth, mc.getMeasures);
router.post('/', ...auth, mc.register);

module.exports = router;