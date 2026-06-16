'use strict';

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Müşteri menüsü (QR ile açılan ana sayfa)
router.get('/', publicController.menu);

module.exports = router;
