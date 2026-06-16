# ---- Çam Vadisi QR Menü ----
# node:sqlite yerleşik olduğundan native derleme/araç gerekmez.
# node:sqlite Node 22.5+ ister; 22 hâlâ deneysel uyarı verir → 24 kullanıyoruz.
FROM node:24-bookworm-slim

WORKDIR /app

# Önce sadece bağımlılık manifesti → katman önbelleği
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Uygulama kaynakları
COPY . .

# Kalıcı veriler için dizinler (compose'ta volume olarak bağlanır)
RUN mkdir -p data public/uploads

ENV NODE_ENV=production
ENV NODE_OPTIONS=--disable-warning=ExperimentalWarning
EXPOSE 3000

CMD ["node", "src/app.js"]
