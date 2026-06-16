'use strict';

/**
 * multer ile ürün görseli yükleme.
 * - Dosyalar public/uploads/ altına benzersiz adla kaydedilir.
 * - Yalnızca görsel MIME tipleri kabul edilir (fileFilter).
 * - Boyut sınırı 5 MB.
 * DB'ye "/uploads/<dosya>" yolu yazılır (itemController).
 */
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const id = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${id}${ext || '.jpg'}`);
  },
});

function fileFilter(req, file, cb) {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(null, false); // görsel değilse sessizce yok say (form yine kaydedilir)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
