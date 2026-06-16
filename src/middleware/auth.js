'use strict';

/**
 * Oturum kontrolü. session.userId yoksa login sayfasına yönlendirir.
 * Korumalı tüm /admin rotalarının önüne takılır.
 */
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/admin/login');
}

/**
 * Zaten giriş yapmış kullanıcıyı login sayfasından panele yollar.
 */
function redirectIfAuthed(req, res, next) {
  if (req.session && req.session.userId) return res.redirect('/admin');
  return next();
}

module.exports = { requireLogin, redirectIfAuthed };
