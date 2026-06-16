# Yol Haritası (Roadmap) - Görsel Optimizasyonu

## Aşama 1: Görselleri WebP Formatına Dönüştürme ve Sıkıştırma
- [ ] Python PIL (Pillow) kütüphanesini kullanarak `public/uploads/` altındaki 1024x1024 boyutlu PNG görsellerini 400x400 piksel boyutlarına küçültüp `.webp` formatında kaydetmek.
- [ ] Eski büyük boyutlu `.png` dosyalarını diskten silmek.

## Aşama 2: Veritabanı ve Kod Güncellemesi
- [ ] `src/config/db.js` dosyasındaki örnek görsel yollarını `.png` yerine `.webp` olarak güncellemek.
- [ ] Mevcut SQLite veritabanındaki `items` tablosunu güncelleyip `.png` uzantılı yolları `.webp` yapmak.

## Aşama 3: Git Güncellemesi
- [ ] Eski büyük `.png` dosyalarını Git'ten silmek.
- [ ] Yeni küçük `.webp` dosyalarını Git'e eklemek ve push'lamak.
