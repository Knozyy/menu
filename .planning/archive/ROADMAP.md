# Yol Haritası (Roadmap) - Görsel Ekleme ve Menü Güncelleme (Tamamlandı)

## Aşama 1: Görsel Üretimi ve Hazırlık (Tamamlandı)
- [x] Menüdeki 12 ana yemek/çorba/tatlı/içecek için yapay zeka ile profesyonel yemek fotoğrafları üretildi:
  1. Mercimek Çorbası
  2. Yayla Çorbası
  3. Çoban Salata
  4. Sigara Böreği
  5. Mantı
  6. Kuzu Tandır
  7. Adana Kebap
  8. Kuzu Pirzola
  9. Künefe
  10. Sütlaç
  11. Ayran
  12. Şalgam
- [x] Üretilen görsellerin `public/uploads/` dizinine kopyalanması ve uygun isimlerle (`lentil_soup.png`, `yayla_soup.png` vb.) kaydedilmesi.

## Aşama 2: Veritabanının Güncellenmesi (Tamamlandı)
- [x] SQLite veritabanındaki her bir ürün için `image_url` alanlarının ilgili dosya yollarıyla (`/uploads/xxx.png` vb.) güncellenmesi.
- [x] Gelecekte veya başka sunucularda otomatik güncellenebilmesi için `src/config/db.js` içindeki `seed` fonksiyonu güncellendi.

## Aşama 3: Test ve Doğrulama (Tamamlandı)
- [x] Uygulamayı yerelde çalıştırıp menü sayfasında görsellerin doğru şekilde yüklendiğini teyit etmek.
- [x] Değişiklikleri Git deposuna commit ve push etmek.
