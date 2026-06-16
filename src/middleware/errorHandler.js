'use strict';

/** 404 — eşleşmeyen rota. */
function notFound(req, res) {
  res.status(404);
  if (req.accepts('html')) {
    return res.render('error', {
      title: '404',
      code: 404,
      message: 'Sayfa bulunamadı.',
    });
  }
  res.json({ error: 'Not found' });
}

/** Genel hata yakalayıcı. CSRF ve diğer hatalar burada toparlanır. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const code = err.status || err.statusCode || 500;
  res.status(code);
  if (req.accepts('html')) {
    return res.render('error', {
      title: String(code),
      code,
      message:
        code === 403
          ? 'Oturum doğrulaması başarısız (CSRF). Lütfen sayfayı yenileyip tekrar deneyin.'
          : 'Beklenmeyen bir hata oluştu.',
    });
  }
  res.json({ error: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };
