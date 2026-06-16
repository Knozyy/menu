'use strict';

const db = require('../config/db');

module.exports = {
  /** Tüm kategoriler, sıralı. */
  all() {
    return db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  /** Her kategorinin yanında ürün sayısı (panel listesi için). */
  allWithCounts() {
    return db
      .prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id) AS item_count
         FROM categories c
         ORDER BY c.sort_order, c.id`
      )
      .all();
  },

  create(name) {
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM categories').get().m;
    return db
      .prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)')
      .run(name, max + 1).lastInsertRowid;
  },

  rename(id, name) {
    return db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
  },

  countItems(id) {
    return db.prepare('SELECT COUNT(*) AS n FROM items WHERE category_id = ?').get(id).n;
  },

  /**
   * Kategoriyi siler. FK RESTRICT nedeniyle içinde ürün varsa SQLite hata fırlatır;
   * çağıran taraf önce countItems ile kontrol edip kullanıcıya uyarı gösterir.
   */
  remove(id) {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  },

  /** İki kategorinin sort_order değerlerini takas eder (yukarı/aşağı taşıma). */
  swapOrder(idA, idB) {
    const a = this.findById(idA);
    const b = this.findById(idB);
    if (!a || !b) return false;
    const tx = db.transaction(() => {
      db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(b.sort_order, a.id);
      db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(a.sort_order, b.id);
    });
    tx();
    return true;
  },
};
