'use strict';

/**
 * SQLite bağlantısı + şema kurulumu.
 *
 * - Node'un yerleşik "node:sqlite" modülü kullanılır (derleme/native bağımlılık YOK).
 * - API better-sqlite3'e çok benzer: prepare/run/get/all senkron çalışır.
 * - Tablolar açılışta "IF NOT EXISTS" ile kurulur; DB boşsa admin + örnek veri seed edilir.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'menu.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON'); // FK kısıtlarının (RESTRICT) etkin olması için ŞART

/**
 * better-sqlite3 benzeri transaction yardımcısı: bir fonksiyon döndürür,
 * çağrıldığında BEGIN/COMMIT (hata olursa ROLLBACK) ile sarar.
 */
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN');
  try {
    const result = fn(...args);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

function hasColumn(table, col) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
}
function addColumn(table, col, ddl) {
  if (!hasColumn(table, col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      name         TEXT NOT NULL,
      description  TEXT NOT NULL DEFAULT '',
      price        REAL NOT NULL DEFAULT 0,
      image_url    TEXT NOT NULL DEFAULT '',
      is_available INTEGER NOT NULL DEFAULT 1,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
  `);

  // Çok dilli (İngilizce) alanlar — mevcut DB'ye güvenli/idempotent ekleme
  addColumn('categories', 'name_en', "name_en TEXT NOT NULL DEFAULT ''");
  addColumn('items', 'name_en', "name_en TEXT NOT NULL DEFAULT ''");
  addColumn('items', 'description_en', "description_en TEXT NOT NULL DEFAULT ''");
}

/**
 * Örnek (seed) verinin İngilizce karşılıklarını doldurur.
 * Yalnızca name_en'i boş olan ve bilinen Türkçe adla eşleşen satırları günceller;
 * kullanıcının elle girdiği çevirileri ASLA ezmez. Her açılışta güvenle çalışır.
 */
function backfillEnglish() {
  const cats = {
    'Çorbalar': 'Soups', 'Başlangıçlar': 'Starters', 'Ana Yemekler': 'Main Courses',
    'Izgaralar': 'Grills', 'Tatlılar': 'Desserts', 'İçecekler': 'Beverages',
  };
  const items = {
    'Mercimek Çorbası': ['Red Lentil Soup', 'Traditional red lentils'],
    'Yayla Çorbası': ['Yayla Soup', 'With yogurt and mint'],
    'Çoban Salata': ["Shepherd's Salad", 'Seasonal vegetables'],
    'Sigara Böreği': ['Cheese Rolls', 'With cheese, 6 pieces'],
    'Mantı': ['Mantı (Turkish Dumplings)', 'Handmade, with yogurt'],
    'Kuzu Tandır': ['Slow-Roasted Lamb', '6 hours in a wood oven'],
    'Adana Kebap': ['Adana Kebab', 'Spicy, char-grilled'],
    'Kuzu Pirzola': ['Lamb Chops', 'Grilled, 4 pieces'],
    'Künefe': ['Künefe', 'With pistachio'],
    'Sütlaç': ['Rice Pudding', 'Oven-baked'],
    'Ayran': ['Ayran', 'Homemade, frothy'],
    'Şalgam': ['Şalgam (Turnip Juice)', 'Hot / mild'],
  };
  const upCat = db.prepare("UPDATE categories SET name_en = ? WHERE name = ? AND (name_en IS NULL OR name_en = '')");
  for (const [tr, en] of Object.entries(cats)) upCat.run(en, tr);
  const upItem = db.prepare("UPDATE items SET name_en = ?, description_en = ? WHERE name = ? AND (name_en IS NULL OR name_en = '')");
  for (const [tr, [en, den]] of Object.entries(items)) upItem.run(en, den, tr);
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (userCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || '1234';
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
    console.log(`[seed] Admin kullanıcısı oluşturuldu: "${username}"`);
  }

  const catCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)');
    const insertItem = db.prepare(
      `INSERT INTO items (category_id, name, description, price, image_url, is_available, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const sampleCats = ['Çorbalar', 'Başlangıçlar', 'Ana Yemekler', 'Izgaralar', 'Tatlılar', 'İçecekler'];
    const sampleItems = [
      ['Mercimek Çorbası', 'Geleneksel kırmızı mercimek', 85, '/uploads/mercimek_corbasi.webp', 1, 1],
      ['Yayla Çorbası', 'Yoğurtlu, naneli', 90, '/uploads/yayla_corbasi.webp', 1, 1],
      ['Çoban Salata', 'Mevsim sebzeleri', 110, '/uploads/coban_salatasi.webp', 1, 2],
      ['Sigara Böreği', 'Peynirli, 6 adet', 120, '/uploads/sigara_boregi.webp', 0, 2],
      ['Mantı', 'El açması, yoğurtlu', 220, '/uploads/manti.webp', 1, 3],
      ['Kuzu Tandır', 'Odun fırınında 6 saat', 380, '/uploads/kuzu_tandir.webp', 1, 3],
      ['Adana Kebap', 'Acılı, közde', 290, '/uploads/adana_kebap.webp', 1, 4],
      ['Kuzu Pirzola', 'Mangalda, 4 adet', 420, '/uploads/kuzu_pirzola.webp', 0, 4],
      ['Künefe', 'Antep fıstıklı', 150, '/uploads/kunefe.webp', 1, 5],
      ['Sütlaç', 'Fırında', 95, '/uploads/sutlac.webp', 1, 5],
      ['Ayran', 'Ev yapımı, köpüklü', 35, '/uploads/ayran.webp', 1, 6],
      ['Şalgam', 'Acılı / acısız', 40, '/uploads/salgam.webp', 1, 6],
    ];

    const tx = db.transaction(() => {
      const catIds = sampleCats.map((name, i) => Number(insertCat.run(name, i).lastInsertRowid));
      sampleItems.forEach(([name, desc, price, img, avail, catIndex], i) => {
        insertItem.run(catIds[catIndex - 1], name, desc, price, img, avail, i);
      });
    });
    tx();
    console.log('[seed] Örnek menü verisi eklendi.');
  } else {
    // Mevcut veritabanında .png uzantılı görsel yolları varsa, bunları .webp yap (Optimizasyon geçişi)
    const pngItemsCount = db.prepare("SELECT COUNT(*) AS n FROM items WHERE image_url LIKE '%.png'").get().n;
    if (pngItemsCount > 0) {
      db.exec("UPDATE items SET image_url = replace(image_url, '.png', '.webp') WHERE image_url LIKE '%.png'");
      console.log(`[seed] ${pngItemsCount} ürünün görsel uzantısı .png'den .webp'ye güncellendi.`);
    }

    // Mevcut veritabanında görsel yolları tamamen boşsa, örnek ürünlerin görsel yollarını güncelle
    const itemsWithoutImages = db.prepare("SELECT COUNT(*) AS n FROM items WHERE image_url = '' OR image_url IS NULL").get().n;
    if (itemsWithoutImages > 0) {
      const updateStmt = db.prepare("UPDATE items SET image_url = ? WHERE name = ? AND (image_url = '' OR image_url IS NULL)");
      const imageMappings = {
        'Mercimek Çorbası': '/uploads/mercimek_corbasi.webp',
        'Yayla Çorbası': '/uploads/yayla_corbasi.webp',
        'Çoban Salata': '/uploads/coban_salatasi.webp',
        'Sigara Böreği': '/uploads/sigara_boregi.webp',
        'Mantı': '/uploads/manti.webp',
        'Kuzu Tandır': '/uploads/kuzu_tandir.webp',
        'Adana Kebap': '/uploads/adana_kebap.webp',
        'Kuzu Pirzola': '/uploads/kuzu_pirzola.webp',
        'Künefe': '/uploads/kunefe.webp',
        'Sütlaç': '/uploads/sutlac.webp',
        'Ayran': '/uploads/ayran.webp',
        'Şalgam': '/uploads/salgam.webp'
      };
      const tx = db.transaction(() => {
        for (const [name, img] of Object.entries(imageMappings)) {
          updateStmt.run(img, name);
        }
      });
      tx();
      console.log('[seed] Mevcut örnek ürünlerin görsel yolları güncellendi.');
    }
  }
}

migrate();
seed();
backfillEnglish();

module.exports = db;
