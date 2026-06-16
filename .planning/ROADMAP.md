# Yol Haritası (Roadmap)

## Aşama 1: Sorun Analizi ve Planlama (Tamamlandı)
- [x] SQLite veritabanı incelendi, varsayılan `admin` kullanıcısının şifresinin `1234` olduğu doğrulandı.
- [x] Sunucudaki `ForbiddenError: invalid csrf token` hatasının sebebi tespit edildi:
  1. Sunucuda `secure: isProd` çerez ayarı sebebiyle (veya proxy yapılandırması eksik olduğunda) oturum çerezi tarayıcıya gönderilemiyor/alınamıyor.
  2. `login.ejs` dosyasında iç içe geçmiş (nested) `<form>` etiketleri bulunuyor. Bu HTML standartlarına aykırıdır ve tarayıcılarda form verilerinin veya CSRF token alanlarının kaybolmasına, yanlış formun gönderilmesine sebep olur.

## Aşama 2: Düzeltmeler ve İyileştirmeler (Sıradaki)
- [ ] `login.ejs` içindeki iç içe geçmiş form yapılarını düzeltmek. Dil ve tema değiştirme formlarını ana kartın dışına veya bağımsız alanlara taşımak.
- [ ] `src/app.js` dosyasına `app.set('trust proxy', 1);` satırını eklemek (ters proxy arkasında secure cookie'lerin çalışabilmesi için).
- [ ] Yerel değişiklikleri git'e commit etmek ve push'lamak.
- [ ] Kullanıcıya sunucu tarafında nasıl test etmesi ve hangi adımları izlemesi gerektiği konusunda rehberlik etmek.
