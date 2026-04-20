const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getRates,
  convertCurrency
} = require('../controllers/currency.controller');

router.get('/rates', protect, getRates);
router.post('/convert', protect, convertCurrency);

module.exports = router;