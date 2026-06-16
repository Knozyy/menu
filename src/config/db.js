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
      `INSERT INTO items (category_id, name, description, price, is_available, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const sampleCats = ['Çorbalar', 'Başlangıçlar', 'Ana Yemekler', 'Izgaralar', 'Tatlılar', 'İçecekler'];
    const sampleItems = [
      ['Mercimek Çorbası', 'Geleneksel kırmızı mercimek', 85, 1, 1],
      ['Yayla Çorbası', 'Yoğurtlu, naneli', 90, 1, 1],
      ['Çoban Salata', 'Mevsim sebzeleri', 110, 1, 2],
      ['Sigara Böreği', 'Peynirli, 6 adet', 120, 0, 2],
      ['Mantı', 'El açması, yoğurtlu', 220, 1, 3],
      ['Kuzu Tandır', 'Odun fırınında 6 saat', 380, 1, 3],
      ['Adana Kebap', 'Acılı, közde', 290, 1, 4],
      ['Kuzu Pirzola', 'Mangalda, 4 adet', 420, 0, 4],
      ['Künefe', 'Antep fıstıklı', 150, 1, 5],
      ['Sütlaç', 'Fırında', 95, 1, 5],
      ['Ayran', 'Ev yapımı, köpüklü', 35, 1, 6],
      ['Şalgam', 'Acılı / acısız', 40, 1, 6],
    ];

    const tx = db.transaction(() => {
      const catIds = sampleCats.map((name, i) => Number(insertCat.run(name, i).lastInsertRowid));
      sampleItems.forEach(([name, desc, price, avail, catIndex], i) => {
        insertItem.run(catIds[catIndex - 1], name, desc, price, avail, i);
      });
    });
    tx();
    console.log('[seed] Örnek menü verisi eklendi.');
  }
}

migrate();
seed();

module.exports = db;
