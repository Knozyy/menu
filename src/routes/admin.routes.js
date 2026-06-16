'use strict';

const express = require('express');
const router = express.Router();

const { requireLogin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const dashboardController = require('../controllers/dashboardController');
const categoryController = require('../controllers/categoryController');
const itemController = require('../controllers/itemController');
const qrController = require('../controllers/qrController');

module.exports = (csrf) => {
  // Bu router'a bağlanan TÜM rotalar oturum ister
  router.use(requireLogin);

  // Dashboard
  router.get('/', dashboardController.index);

  // QR kod
  router.get('/qr', qrController.index);
  router.get('/qr/download', qrController.download);

  // Kategoriler (multipart yok → CSRF doğrudan)
  router.get('/categories', categoryController.list);
  router.post('/categories', csrf, categoryController.create);
  router.post('/categories/:id/edit', csrf, categoryController.rename);
  router.post('/categories/:id/delete', csrf, categoryController.remove);
  router.post('/categories/:id/move/:dir', csrf, categoryController.move);

  // Ürünler
  router.get('/products', itemController.list);
  router.get('/products/new', itemController.newForm);
  router.get('/products/:id/edit', itemController.editForm);
  router.post('/products/bulk', csrf, itemController.bulk);
  router.post('/products/:id/delete', csrf, itemController.remove);
  // Multipart formlar: önce multer (gövdeyi+_csrf alanını ayrıştırır), sonra CSRF kontrolü
  router.post('/products', upload.single('image_file'), csrf, itemController.create);
  router.post('/products/:id', upload.single('image_file'), csrf, itemController.update);

  return router;
};
