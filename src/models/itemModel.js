'use strict';

const db = require('../config/db');

module.exports = {
  /**
   * Public menü için: kategoriler sıralı, her birinin içinde SADECE stoktaki
   * (is_available = 1) ürünler gömülü olarak döner. Boş kategoriler atlanır.
   */
  menuTree() {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
    const items = db
      .prepare('SELECT * FROM items WHERE is_available = 1 ORDER BY sort_order, id')
      .all();

    const byCat = new Map(categories.map((c) => [c.id, { ...c, items: [] }]));
    for (const item of items) {
      const cat = byCat.get(item.category_id);
      if (cat) cat.items.push(item);
    }
    return [...byCat.values()].filter((c) => c.items.length > 0);
  },

  /** Panel listesi: tüm ürünler (stok dışı dahil), arama/kategori filtresiyle. */
  list({ q = '', categoryId = null } = {}) {
    const clauses = [];
    const params = [];
    if (categoryId) {
      clauses.push('i.category_id = ?');
      params.push(categoryId);
    }
    if (q) {
      clauses.push('(i.name LIKE ? OR i.description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return db
      .prepare(
        `SELECT i.*, c.name AS category_name
         FROM items i
         JOIN categories c ON c.id = i.category_id
         ${where}
         ORDER BY i.sort_order, i.id`
      )
      .all(...params);
  },

  findById(id) {
    return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  },

  recent(limit = 5) {
    return db
      .prepare(
        `SELECT i.*, c.name AS category_name
         FROM items i JOIN categories c ON c.id = i.category_id
         ORDER BY i.id DESC LIMIT ?`
      )
      .all(limit);
  },

  countAll() {
    return db.prepare('SELECT COUNT(*) AS n FROM items').get().n;
  },

  countAvailable() {
    return db.prepare('SELECT COUNT(*) AS n FROM items WHERE is_available = 1').get().n;
  },

  avgPrice() {
    return db.prepare('SELECT AVG(price) AS a FROM items').get().a || 0;
  },

  /** Kategori bazında ürün sayıları (dashboard çubukları için). */
  countsByCategory() {
    return db
      .prepare(
        `SELECT c.id, c.name, COUNT(i.id) AS count
         FROM categories c
         LEFT JOIN items i ON i.category_id = c.id
         GROUP BY c.id
         ORDER BY c.sort_order, c.id`
      )
      .all();
  },

  create(data) {
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM items').get().m;
    const info = db
      .prepare(
        `INSERT INTO items (category_id, name, description, price, image_url, is_available, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.category_id,
        data.name,
        data.description,
        data.price,
        data.image_url,
        data.is_available,
        max + 1
      );
    return Number(info.lastInsertRowid);
  },

  update(id, data) {
    return db
      .prepare(
        `UPDATE items SET
           category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?
         WHERE id = ?`
      )
      .run(
        data.category_id,
        data.name,
        data.description,
        data.price,
        data.image_url,
        data.is_available,
        id
      );
  },

  remove(id) {
    return db.prepare('DELETE FROM items WHERE id = ?').run(id);
  },

  removeMany(ids) {
    if (!ids.length) return;
    const ph = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM items WHERE id IN (${ph})`).run(...ids);
  },

  moveMany(ids, categoryId) {
    if (!ids.length) return;
    const ph = ids.map(() => '?').join(',');
    db.prepare(`UPDATE items SET category_id = ? WHERE id IN (${ph})`).run(categoryId, ...ids);
  },
};
