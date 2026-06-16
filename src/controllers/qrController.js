'use strict';

const QRCode = require('qrcode');

/**
 * QR'a kodlanacak menü adresi.
 * ?url ile elle override edilebilir (yalnızca http/https); yoksa istekten türetilir.
 * (trust proxy açık olduğundan ters proxy arkasında protokol/host doğru gelir.)
 */
function menuUrl(req) {
  const q = (req.query.url || '').trim();
  if (/^https?:\/\/.+/i.test(q)) return q;
  return `${req.protocol}://${req.get('host')}/`;
}

module.exports = {
  async index(req, res, next) {
    try {
      const url = menuUrl(req);
      const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
      res.render('admin/qr', {
        url,
        svg,
        pageTitle: res.locals.t.nav_qr,
        pageSub: res.locals.t.qr_sub,
        activeNav: 'qr',
      });
    } catch (err) {
      next(err);
    }
  },

  async download(req, res, next) {
    try {
      const url = menuUrl(req);
      const format = req.query.format === 'svg' ? 'svg' : 'png';
      if (format === 'svg') {
        const svg = await QRCode.toString(url, { type: 'svg', margin: 2 });
        res.set('Content-Type', 'image/svg+xml');
        res.set('Content-Disposition', 'attachment; filename="menu-qr.svg"');
        return res.send(svg);
      }
      const buf = await QRCode.toBuffer(url, { type: 'png', margin: 2, width: 1024 });
      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', 'attachment; filename="menu-qr.png"');
      res.send(buf);
    } catch (err) {
      next(err);
    }
  },
};
