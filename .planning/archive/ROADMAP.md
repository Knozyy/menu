# Yol Haritası (Roadmap) - Görsel Optimizasyonu (Tamamlandı)

## Aşama 1: Görselleri WebP Formatına Dönüştürme ve Sıkıştırma (Tamamlandı)
- [x] Python PIL (Pillow) kütüphanesini kullanarak `public/uploads/` altındaki 1024x1024 boyutlu PNG görsellerini 400x400 piksel boyutlarına küçültüp `.webp` formatında kaydetmek.
- [x] Eski büyük boyutlu `.png` dosyalarını diskten silmek.

## Aşama 2: Veritabanı ve Kod Güncellemesi (Tamamlandı)
- [x] `src/config/db.js` dosyasındaki örnek görsel yollarını `.png` yerine `.webp` olarak güncellemek.
- [x] Mevcut SQLite veritabanındaki `items` tablosunu güncelleyip `.png` uzantılı yolları `.webp` yapmak.

## Aşama 3: Git Güncellemesi (Tamamlandı)
- [x] Eski büyük `.png` dosyalarını Git'ten silmek.
- [x] Yeni küçük `.webp` dosyalarını Git'e eklemek ve push'lamak.
