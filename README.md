# 🚀 Siber Avcı: 2D Uzay Arenası (Kozmik Kaos)

**Siber Avcı: 2D Uzay Arenası**, HTML5 Canvas, modern Web Audio API, TypeScript ve React kullanılarak geliştirilmiş, retro-fütüristik neon estetiğe sahip dinamik bir uzay roguelite aksiyon oyunudur.

Oyuncu, galaksinin derinliklerinde tehlikeli sektörleri aşarak düşman filolarını yok eder, gemisini ve silahlarını geliştirir, devasa boss savaşlarında hayatta kalmaya çalışır ve 10 sektörden oluşan büyük seferi tamamlamayı hedefler.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🪐 10 Sektörlü Galaktik Sefer (Seviye Sistemi)
Oyun tek bir sonsuz arenayla sınırlı kalmayıp, 10 farklı benzersiz sektöre ayrılmış aşamalı bir sefer haritası sunar:
- **Sektör 1: Nova İstasyonu** — Temel mekanikleri öğrenme ve ısınma sektörü.
- **Sektör 2: Krynn Asteroid Kuşağı** — Yoğun asteroid fırtınaları ve madencilik fırsatları.
- **Sektör 3: Mor İyon Yarığı** — Kalkanları zorlayan iyon dalgaları ve çevik avcılar.
- **Sektör 4: Güneş Radyasyon Bölgesi** — Yüksek hızlı plazma fırtınaları ve radyasyon tehlikeleri.
- **Sektör 5: Siber Muhafız Kalesi** — **Ara Boss:** Devasa *Aegis-7 Siber Amiral Gemisi*.
- **Sektör 6: Kuantum Çöküş Bölgesi** — Uzay-zaman dalgalanmaları ve solucan delikleri.
- **Sektör 7: Terk Edilmiş Tersane** — Gizli taretler, enkazlar ve kamikaze dron sürüleri.
- **Sektör 8: Biyolojik Kovan Çekirdeği** — **Büyük Boss:** *Kovan Kraliçesi Leviathan*.
- **Sektör 9: Plazma Aşırı Yükleme Reaktörü** — Kararsız reaktör arkları ve aşırı düşman ateşi.
- **Sektör 10: Hiçliğin Kalbi** — **Final Boss:** Galaktik tehdit *Omega Primus*.

Her sektörde hayatta kalma sürenize ve yok ettiğiniz düşman sayısına göre **1 ila 3 Yıldız** kazanırsınız. İlerlemeleriniz tarayıcı hafızasında yerel olarak (`localStorage`) saklanır.

---

### 2. 🎵 Dinamik Web Audio Müzik ve Ses Motoru
Harici ses dosyalarına veya internet bağlantısına ihtiyaç duymayan, saf **Web Audio API** osilatörleri ile gerçek zamanlı (procedural) sentezlenen zengin bir müzik sistemi:
- **5 Farklı Müzik Parçası**:
  1. *Kozmik Derinlik* (96 BPM) — Atmosferik synthwave ve derin baslar.
  2. *Siberpunk Hızlanış* (124 BPM) — Yüksek enerjili synth arpejleri ve 4/4 ritim.
  3. *Hiçlik Dretnotu* (112 BPM) — Ağır endüstriyel karanlık akorlar.
  4. *Yıldız Savaşçısı* (128 BPM) — Hızlı synthwave ve dinamik lead melodileri.
  5. *Omega Çekirdek* (144 BPM) — Boss savaşlarına özel yüksek tempolu parçalar.
- **Dinamik Savaş Şiddeti (BPM Hızlanması)**:
  - Ekranda düşman yoğunluğu arttığında ve oyuncunun kalkanı/canı tehlikeli seviyelere düştüğünde, müzik temposu otomatik olarak **+36 BPM'e kadar hızlanır**.
  - Savaş yatıştığında tempo yumuşak bir geçişle orijinal hızına geri döner.
- **Retro Ses Efektleri**: Lazer atışları, plazma patlamaları, gövde darbeleri, atılma fısıltısı ve seviye atlama melodileri.

---

### 3. 🛸 Aerodinamik Kanatlar, Kanat Roketleri ve Silah Cephaneliği
- **Aerodinamik Kanat Yapısı & Kanat Roket Bataryaları**:
  - Oyuncu gemisi artık çift yönlü açılı siber kanatlara (swept-back aerofoils) ve kanat uçlarına monte edilmiş çift roket podlarına sahiptir.
  - **Kanat Roketleri**: Sol ve sağ kanat uçlarından dönüşümlü olarak ateşlenen, duman izi bırakan ve düşmanları kovalayarak alan etkili patlama hasarı veren yüksek güçlü güdümlü roketler! Roketler hazır olduğunda kanat uçlarındaki savaş başlıkları turuncu/neon parıltıyla yanar.
- **5 Farklı Değiştirilebilir Siber Silah**:
  1. *İkiz Foton Lazer*: Yüksek atış hızlı, dengeli standart lazer topları.
  2. *Plazma Dağıtıcı (Pompalı)*: 5'li koni şeklinde yayılan, yakın mesafede yıkıcı ağır plazma saçması.
  3. *Kuantum Raylı Top (Railgun)*: Düşman hatlarını ve asteroidleri delip geçen hiper-hızlı kuantum ışını.
  4. *Girdap Güdümlü Füzeleri*: Düşmanları akıllıca takip eden mikro füze salvosu.
  5. *Tesla İyon Arkı*: Düşman kalkanlarını hızla eriten elektrik arkları.
- **Hızlı Silah Değiştirme**: `[Q]` / `[E]` veya `[1-5]` tuşlarıyla ya da arayüzdeki silah rozetine tıklayarak silahlar arasında anında geçiş yapabilirsiniz.

---

### 4. 👾 Gelişmiş Düşman Filosu ve Yeni Gemi Sınıfları
Standart sürü böcekleri ve keskin nişancıların yanı sıra filoya yeni elit düşman gemileri katıldı:
- **Gizli Avcı (Stealth Stalker)**: Kamuflaj kalkanını açarak neredeyse görünmez hale gelir, arkadan yanaşır ve 3'lü plazma yelpazesi ateşleyerek geri çekilir.
- **Kalkanlı Kruvazör (Shielded Cruiser)**: Ön cephesinde kurşun geçirmez enerji bariyeri taşır; oyuncunun mermilerini sektirir. Sadece arkadan veya yan kanatlardan vurulabilir ya da patlayıcı roketlerle aşılabilir!
- **Dron Taşıyıcı Ana Gemi (Drone Carrier)**: Uzaktan oyuncuyu takip eden, üzerinde çift iniş pisti ve uyarı ışıkları barındıran devasa taşıyıcı gemi. Düzenli aralıklarla kamikaze sürü dronları fırlatır!
- **Aegis-7 Muhafız Dretnotu & Kovan Kraliçesi & Omega Primus**: Zorlu sektör sonu boss karşılaşmaları.

---

### 5. 🌀 Kalıcı Sefer İlerlemesi ve Bölüm Geçişlerinde Gemi Koruması
- **Bölüm Geçişlerinde Tam Koruma**: Herhangi bir sektör/bölüm tamamlandığında ve sonraki bölüme geçildiğinde, geminizin kazandığı **tüm özellikler aynen korunur**:
  - Gemi Seviyesi (Level) ve mevcut XP ilerlemesi
  - Gövde (HP) ve Kalkan (Shield) üst sınır geliştirmeleri (yeni sektöre başlarken tamir edilerek tam kapasiteye çıkarılır)
  - Seçilen tüm Roguelite perkleri (Çift Namlu, Delici Mermiler, Manyetik Toplayıcı, EMP Nova, vb.)
  - Açılan tüm özel silahlar ve aktif silah seçimi
  - Kanat roket bataryası geliştirmeleri
- **Derin Uzay Sıçraması (Uzak Mesafe Warp Atılması)**:
  - Sıçrama (Dash) yeteneği derin uzayın vakum fiziğiyle güçlendirilerek menzili **750 - 950+ piksele** çıkarıldı.
  - Sıçrama anında gemi arkasında kinetik şok dalgası halkaları ve hiper-uzay ışık izi bırakır; düşman kuşatmalarından anında sıyrılmanızı ve geniş sektör haritasında hızla yer değiştirmenizi sağlar.
- **Gezegen Etkileşimi & Madencilik**: Haritada bulunan gezegenlerin çekim alanına girerek kaynak toplayabilir veya gövdenizi onarabilirsiniz.
- **Günlük Görev Sistemi**: Her gün yenilenen görevleri tamamlayarak kalıcı güçlendirme (buff) ödülleri kazanın.
- **Performans Dostu Parçacık Sistemi**: Bellek çöpü (garbage collection) yaratmayan sıfır-tahsisli havuzlama (object pooling) ile 60+ FPS akıcı görsel efektler.

---

## 🎮 Kontroller

### 💻 Masaüstü / Klavye & Fare:
| Tuş / Eylem | İşlev |
| :--- | :--- |
| **W, A, S, D** veya **Yön Tuşları** | Gemiyi hareket ettirir ve yönlendirir |
| **Fare Hareketi** | Nişan alma açısını belirler |
| **Sol Tık** veya **Boşluk (SPACE)** | Seçili silahla ateş eder (Ayrıca kanat roketlerini ateşler) |
| **Q / E** veya **1 - 5 Tuşları** | **Silah Değiştir** — 5 farklı silah tipi arasında döngü |
| **Shift** veya **Sağ Tık** | **Atılma (Dash)** — Hız patlaması ve geçici dokunulmazlık |
| **C** | Galaktik Sefer Haritasını açar / kapatır |
| **M** | Ses efektlerini açar / kapatır |
| **B** | Fon müziğini açar / kapatır |
| **N** | Sonraki müzik parçasına geçer (5 parça arasında döngü) |
| **P** veya **ESC** | Oyunu duraklatır (Pause) |
| **G** | Günlük Görevler panelini açar / kapatır |

### 📱 Mobil / Dokunmatik Ekran:
| Dokunmatik Kontrol | İşlev |
| :--- | :--- |
| **Sol Sanal Joystick (Mavi)** | **360° İlerleme & Dönüş**: Gemiyi istenen yöne çevirir ve o doğrultuda iter. |
| **Sağ Sanal Joystick (Kırmızı)** | **360° Bağımsız Nişan & Kesintisiz Ateş**: Sürüklenen açıya döner ve sürekli ateş açar. |
| **SİLAH Butonu (Renkli Dönen İkon)** | Dokunulduğunda aktif silahı değiştirir (Foton Lazer, Dağıtıcı, Raylı, Füzeler, Tesla). |
| **ATEŞ Butonu (Kırmızı Alev)** | Basılı tutulduğunda seçili silahı ve kanat roketlerini hedefe yönlendirir. |
| **ATILMA Butonu (Sarı Şimşek)** | Dokunulduğunda hız patlaması ve geçici dokunulmazlık (Dash) tetikler. |
| **ROKET GÖSTERGESİ (Pembe Rozet)** | Kanat roketlerinin dolum durumunu ve hazır olduğunu anlık gösterir. |
| **OTO NİŞAN / SERBEST Butonu** | Otomatik hedef kilitleme (en yakın düşman) ile manuel yönlendirme arasında geçiş yapar. |
| **Ekrana Dokunma** | Ekranda herhangi bir noktaya dokunulduğunda gemi doğrudan o noktaya nişan alır. |

---

## 🛠️ Teknolojiler

- **Çekirdek**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Oyun Motoru & Çizim**: HTML5 Canvas 2D API (60 FPS `requestAnimationFrame` döngüsü)
- **Ses Motoru**: Web Audio API (Sentetik osilatörler, gürültü üreteçleri, biquad filtreleri)
- **Stil & Arayüz**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Derleme Aracı**: [Vite](https://vitejs.dev/)
- **Test Çerçevesi**: Node.js yerleşik test çalıştırıcısı (`node:test`, `node:assert/strict`)

---

## 📦 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Sunucu başladığında tarayıcınızda `http://localhost:3000` adresini açarak oyunu oynayabilirsiniz.

### 3. Testleri Çalıştırın
Oyun mekanikleri, sektör ilerlemeleri ve ses motoru hesaplamaları birim testlerle korunmaktadır:
```bash
npm test
```

### 4. Üretim İçin Derleyin
```bash
npm run build
```
Derleme çıktısı `dist/` klasörü altına oluşturulacaktır.

---

## 📁 Proje Dizin Yapısı

```
├── src/
│   ├── game/
│   │   ├── audio.ts           # 5 parçalı Web Audio API müzik & dinamik tempo motoru
│   │   ├── audio.test.ts      # Ses ve tempo mantığı testleri
│   │   ├── combat.ts          # Hasar, kalkan, çarpışma ve can mantığı
│   │   ├── combat.test.ts     # Savaş ve çarpışma testleri
│   │   ├── engine.ts          # Ana oyun döngüsü ve Canvas çizim koordinatörü
│   │   ├── missions.ts        # Günlük görevler ve kalıcı güçlendirmeler
│   │   ├── particles.ts       # Yüksek performanslı parçacık havuzu motoru
│   │   ├── planets.ts         # Gezegen üretimi ve yörünge etkileşimleri
│   │   ├── sectors.ts         # 10 sektörlük sefer haritası ve kilit açma sistemi
│   │   ├── sectors.test.ts    # Sektör ilerleme testleri
│   │   ├── types.ts           # Tüm veri tipleri ve arayüzler
│   │   ├── weapons.ts         # Silah mermi davranışları ve özellik tanımları
│   │   └── weapons.test.ts    # Silah mekanikleri testleri
│   ├── App.tsx                # HUD, Sefer Arayüzü, Ayarlar ve React durum yönetimi
│   ├── main.tsx               # Uygulama giriş noktası
│   └── index.css              # Tailwind CSS yönergeleri
├── index.html                 # HTML şablonu
├── package.json               # Paket bağımlılıkları ve çalıştırma komutları
├── tsconfig.json              # TypeScript yapılandırması
└── vite.config.ts             # Vite yapılandırması
```

---

## 🏆 İpuçları & Taktikler

1. **Atılma (Dash) Yeteneğini Akıllıca Kullanın**: Atılma yaptığınızda aldığınız hasar sıfırlanır; mermi yağmurlarından ve boss lazerlerinden kaçmak için bu dokunulmazlık penceresini değerlendirin.
2. **Gezegenleri Tarayın**: Gövde canınız kritik seviyeye düştüğünde en yakın gezegene yaklaşıp yörüngesine girin ve onarım alanından yararlanın.
3. **Müzik Değişimi**: Savaşın temposuna göre klavyeden `[N]` tuşuna basarak 5 farklı müzik parçası arasında anında geçiş yapabilirsiniz.
4. **Boss Saldırı Kalıpları**: Sektör 5, 8 ve 10'daki boss'lar özel mermi halkaları fırlatır; dairesel hareketlerle etraflarında dönerek kör noktalarını bulun.

İyi oyunlar, Komutan! Galaksinin geleceği senin ellerinde! 🌌
