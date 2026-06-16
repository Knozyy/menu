'use strict';

/**
 * Çam Vadisi — QR Menü uygulaması (Express + EJS + SQLite).
 * Giriş noktası: middleware kurulumu, güvenlik katmanı, rota montajı.
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { csrfSync } = require('csrf-sync');

// .env'i bağımlılık eklemeden basitçe yükle (varsa)
loadDotEnv();

require('./config/db'); // şema + seed (import edilince çalışır)
const i18n = require('./config/i18n');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// --- Görünüm motoru ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Güvenlik başlıkları (helmet) ---
// Tasarım inline style + Google Fonts kullanıyor; CSP buna göre gevşetildi.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        // HTTP sunucuda bu yönerge tarayıcının tüm kaynakları HTTPS'e
        // yükseltmesine neden olur — SSL yoksa CSS/JS/font yüklenemez.
        upgradeInsecureRequests: null,
      },
    },
    // Google Fonts gibi çapraz kaynak (cross-origin) isteklerin
    // engellenmesini önler. Helmet v8 bunu varsayılan olarak etkinleştirir.
    crossOriginEmbedderPolicy: false,
  })
);

// --- Statik dosyalar (css/js/uploads) ---
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: isProd ? '7d' : 0 }));

// --- Gövde ayrıştırma ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Oturum (dosya tabanlı kalıcı store, native bağımlılık yok) ---
const FileStore = require('session-file-store')(session);
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, '..', 'data', 'sessions'),
      ttl: 60 * 60 * 8,
      retries: 1,
      logFn: () => {},
    }),
    secret: process.env.SESSION_SECRET || 'degistir-bunu',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8 saat
    },
  })
);

// --- CSRF (senkron token) ---
const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => req.body && req.body._csrf,
});

// --- Brute-force koruması: yalnızca login POST ---
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Çok fazla deneme. Lütfen birazdan tekrar deneyin.',
});

// --- Şablonlara aktarılan ortak değişkenler (locals) ---
app.use((req, res, next) => {
  const lang = i18n.resolveLang(readCookie(req, 'lang') || process.env.DEFAULT_LANG || 'tr');
  const theme = readCookie(req, 'theme') === 'dark' ? 'dark' : 'light';

  res.locals.lang = lang;
  res.locals.t = i18n.t(lang);
  res.locals.nav = buildNav(res.locals.t);
  res.locals.theme = theme;
  res.locals.brand = process.env.BRAND_NAME || 'Çam Vadisi';
  res.locals.accent = process.env.ACCENT_COLOR || '#2563eb';
  res.locals.accentSoft = hexToRgba(res.locals.accent, theme === 'dark' ? 0.16 : 0.1);
  res.locals.langLabel = lang === 'tr' ? 'EN' : 'TR';
  res.locals.fmt = (v) => i18n.formatPrice(v, lang);
  res.locals.currentPath = req.path;
  res.locals.isAuthed = !!(req.session && req.session.userId);
  res.locals.csrfToken = generateToken(req);
  next();
});

// --- Tercih (tema/dil) değiştirme: cookie yazıp geri yönlendir ---
app.post('/prefs/:key', (req, res) => {
  const { key } = req.params;
  const back = req.get('Referer') || '/';
  if (key === 'theme') {
    const to = readCookie(req, 'theme') === 'dark' ? 'light' : 'dark';
    setCookie(res, 'theme', to);
  } else if (key === 'lang') {
    const to = i18n.resolveLang(readCookie(req, 'lang')) === 'tr' ? 'en' : 'tr';
    setCookie(res, 'lang', to);
  }
  res.redirect(back);
});

// --- Rotalar ---
const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes')(loginLimiter, csrfSynchronisedProtection);
const adminRoutes = require('./routes/admin.routes')(csrfSynchronisedProtection);

app.use('/', publicRoutes);
app.use('/admin', authRoutes); // /admin/login, /admin/logout
app.use('/admin', adminRoutes); // korumalı panel

// --- Hata yönetimi ---
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Çam Vadisi QR Menü → http://localhost:${PORT}`);
  console.log(`Yönetim paneli      → http://localhost:${PORT}/admin`);
});

// ---------- küçük yardımcılar (ek bağımlılık olmadan cookie + .env) ----------
function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const found = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  if (!found) return null;
  try { return decodeURIComponent(found.slice(name.length + 1)); }
  catch (_) { return null; }
}
function setCookie(res, name, value) {
  res.cookie
    ? res.cookie(name, value, { httpOnly: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 365 })
    : res.setHeader('Set-Cookie', `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`);
}
// Navigasyon tanımı (ikonlar tasarımdan). Hem sidebar hem alt bar bunu kullanır.
function buildNav(t) {
  const ICON = {
    dash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>',
    cats: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="6" r="1.3" fill="currentColor"/><circle cx="7" cy="12" r="1.3" fill="currentColor"/><circle cx="7" cy="18" r="1.3" fill="currentColor"/></svg>',
    prods: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };
  return [
    { key: 'dashboard', href: '/admin', label: t.nav_dashboard, icon: ICON.dash },
    { key: 'categories', href: '/admin/categories', label: t.categories, icon: ICON.cats },
    { key: 'products', href: '/admin/products', label: t.products, icon: ICON.prods },
  ];
}

function hexToRgba(hex, a) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(37,99,235,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function loadDotEnv() {
  try {
    const fs = require('fs');
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        // Windows CRLF satır sonlarından kalan \r karakterini temizle
        const value = m[2].replace(/^["']|["']$/g, '').replace(/\r$/, '');
        process.env[m[1]] = value;
      }
    }
  } catch (_) {
    /* yok say */
  }
}
