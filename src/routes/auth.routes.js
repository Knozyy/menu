'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthed, requireLogin } = require('../middleware/auth');

module.exports = (loginLimiter, csrfProtection) => {
  router.get('/login', redirectIfAuthed, authController.getLogin);
  router.post('/login', loginLimiter, csrfProtection, authController.postLogin);
  router.post('/logout', requireLogin, csrfProtection, authController.postLogout);
  return router;
};
