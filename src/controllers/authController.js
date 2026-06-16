'use strict';

const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

module.exports = {
  getLogin(req, res) {
    res.render('admin/login', {
      error: req.query.error ? res.locals.t.login_err : null,
      username: '',
    });
  },

  postLogin(req, res) {
    const { username = '', password = '' } = req.body;
    const user = userModel.findByUsername(username.trim());
    const ok = user && bcrypt.compareSync(password, user.password);

    if (!ok) {
      return res.status(401).render('admin/login', {
        error: res.locals.t.login_err,
        username: username.trim(),
      });
    }

    // Oturum sabitleme (session fixation) saldırılarına karşı session'ı yenile
    req.session.regenerate((err) => {
      if (err) return res.status(500).render('admin/login', { error: 'Sunucu hatası', username: '' });
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/admin');
    });
  },

  postLogout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/admin/login');
    });
  },
};
