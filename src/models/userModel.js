'use strict';

const db = require('../config/db');

module.exports = {
  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  findById(id) {
    return db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(id);
  },
};
