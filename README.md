# Çam Vadisi — QR Dijital Menü

QR ile açılan, **yalnızca görüntüleme** amaçlı dijital menü + yöneticinin ürün/fiyatları
anında güncellediği yönetim paneli. Sepet/sipariş/ödeme **yoktur**.

Tasarım [Claude Design](https://claude.ai/design) ile yapıldı; bu repo onu
**Express + EJS + SQLite** olarak birebir hayata geçirir.

## Teknoloji

| Katman | Seçim | Not |
|--------|-------|-----|
| Sunucu | Node.js + Express | MVC düzeni |
| Şablon | EJS | tasarımın inline-style + CSS değişkeni sistemi taşındı |
| Veritabanı | `node:sqlite` (yerleşik) | **native derleme yok**, Node 22.5+ ister |
| Oturum | express-session + session-file-store | dosya tabanlı, kalıcı |
| Şifre | bcryptjs | hash'lenmiş admin şifresi |
| Güvenlik | helmet · csrf-sync · express-rate-limit | CSP, CSRF token, login brute-force limiti |
| Görsel | multer | dosya yükleme **veya** URL |

## Çalıştırma (yerel)

```bash
cp .env.example .env      # değerleri düzenleyin (özellikle SESSION_SECRET)
npm install
npm start
```

- Müşteri menüsü → http://localhost:3000
- Yönetim paneli → http://localhost:3000/admin
- Demo giriş → `admin` / `1234` (ilk açılışta `.env`'den seed edilir)

> İlk açılışta DB boşsa örnek kategoriler + ürünler ve admin kullanıcısı otomatik oluşturulur.

## Docker ile (tek komut)

```bash
docker compose up -d --build
```

İki kalıcı volume kullanılır: `menu-data` (SQLite) ve `menu-uploads` (yüklenen görseller).
Ortam değişkenleri `docker-compose.yml` üzerinden (ya da `.env` ile) verilir.

## Özellikler

**Müşteri (`/`)** — mobil öncelikli, sticky kategori çipleri + scroll-spy, ürün kartları
(görsel · açıklama · fiyat). Yalnızca stoktaki (`is_available`) ürünler görünür.

**Panel (`/admin`)** — responsive (masaüstü sidebar / mobil alt bar):
- **Dashboard:** kategori/ürün/stok/ortalama fiyat özetleri, son ürünler, kategori dağılımı
- **Kategoriler:** ekle/düzenle/sil, yukarı-aşağı sırala. İçinde ürün olan kategori
  **silinemez** (FK `ON DELETE RESTRICT`) — kullanıcıya uyarı gösterilir
- **Ürünler:** arama + kategori filtresi, toplu seç → taşı/sil, masaüstü tablo / mobil kart
- **Ürün formu:** görsel **dosya yükleme veya URL**, kategori (taşıma), açıklama, fiyat,
  stok aç/kapa anahtarı
- TR/EN dil ve açık/koyu tema (cookie ile kalıcı)

## Klasör Yapısı

```
src/
  config/    db.js (şema+seed), i18n.js
  models/    category / item / user
  controllers/  dashboard / category / item / auth / public
  middleware/   auth · upload (multer) · errorHandler
  routes/    public · auth · admin
  views/     partials/ · admin/ · public/ · error.ejs
  app.js     giriş noktası (güvenlik + oturum + rota montajı)
public/      css/app.css · js/(admin|menu).js · uploads/
data/        menu.db + sessions/ (volume)
```

## Notlar / Kararlar

- Tasarım Tailwind değil **CSS değişkeni + inline style** ile geldiği için birebir o
  sistem taşındı (`public/css/app.css` yalnızca değişkenler, tema, hover ve responsive
  kuralları içerir).
- Dashboard "Düzen A", ürün formu "Düzen B" düzeni benimsendi (tasarımdaki A/B deneme
  toggle'ları gerçek uygulamada kaldırıldı).
- Müşteri menü şablonu (`views/public/menu.ejs`) ayrı menü tasarımı geldiğinde
  güncellenecek geçici-ama-çalışır bir sürümdür; aynı tasarım sistemini kullanır.
