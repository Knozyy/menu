# Yol Haritası (Roadmap) - Görsel Ekleme ve Menü Güncelleme

## Aşama 1: Görsel Üretimi ve Hazırlık
- [ ] Menüdeki 12 ana yemek/çorba/tatlı/içecek için yapay zeka ile profesyonel yemek fotoğrafları üretilmesi:
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
- [ ] Üretilen görsellerin `public/uploads/` dizinine kopyalanması ve uygun isimlerle (`lentil_soup.png`, `yayla_soup.png` vb.) kaydedilmesi.

## Aşama 2: Veritabanının Güncellenmesi
- [ ] SQLite veritabanındaki her bir ürün için `image_url` alanlarının ilgili dosya yollarıyla (`/uploads/lentil_soup.png` vb.) güncellenmesi.

## Aşama 3: Test ve Doğrulama
- [ ] Uygulamayı yerelde çalıştırıp menü sayfasında görsellerin doğru şekilde yüklendiğini teyit etmek.
- [ ] Değişiklikleri Git deposuna commit ve push etmek.
