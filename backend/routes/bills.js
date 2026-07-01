const { Router } = require('express');
const router = Router();
const { checkInfoBill } = require('../controllers/billController');
const { verifyToken } = require('../middleware/authMiddleware');

const auth = [verifyToken];

router.get('/check-info', ...auth, checkInfoBill);

module.exports = router;
