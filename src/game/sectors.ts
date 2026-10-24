// Campaign Sector definitions, progression rules, and local storage persistence

export type SectorHazardType =
  | 'none'
  | 'asteroid_debris'
  | 'ion_disruption'
  | 'solar_radiation'
  | 'gravity_well'
  | 'quantum_distortion';

export interface SectorDef {
  id: number;
  code: string;
  nameTr: string;
  nameEn: string;
  subtitleTr: string;
  descriptionTr: string;
  hazardType: SectorHazardType;
  hazardNameTr: string;
  hazardDescriptionTr: string;
  ambientColor: string;
  gridColor: string;
  targetWaves: number;
  recommendedTrackId: number; // 0 to 4
  bossArchetype?: 'none' | 'aegis_sentinel' | 'titan_boss' | 'hive_queen' | 'omega_primus';
  bossNameTr?: string;
  enemySpeedMultiplier: number;
  enemyHpMultiplier: number;
  spawnRateMultiplier: number;
  starScoreThresholds: [number, number, number]; // [1 star, 2 stars, 3 stars]
}

export interface SectorProgress {
  sectorId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 to 3
  highScore: number;
  bestTimeSeconds: number;
}

export const CAMPAIGN_SECTORS: SectorDef[] = [
  {
    id: 1,
    code: 'SEKTÖR-01',
    nameTr: 'Nova Başlangıç İstasyonu',
    nameEn: 'Nova Station Outpost',
    subtitleTr: 'Devriye İHA Temizliği ve Uçuş Talimi',
    descriptionTr: 'Federasyonun sınır karakolu. Hafif İHA sürülerini temizleyerek itki ve nişan sistemlerini kalibre edin.',
    hazardType: 'none',
    hazardNameTr: 'Güvenli Bölge',
    hazardDescriptionTr: 'Aktif çevresel tehdit yok. Temel savaş eğitimi.',
    ambientColor: '#0369a1',
    gridColor: 'rgba(6, 182, 212, 0.08)',
    targetWaves: 3,
    recommendedTrackId: 0, // Kozmik Derinlik
    bossArchetype: 'none',
    enemySpeedMultiplier: 0.9,
    enemyHpMultiplier: 0.85,
    spawnRateMultiplier: 0.85,
    starScoreThresholds: [1500, 3500, 6000],
  },
  {
    id: 2,
    code: 'SEKTÖR-02',
    nameTr: 'Krynn Asteroid Kuşağı',
    nameEn: 'Krynn Asteroid Belt',
    subtitleTr: 'Kozmik Molozlar ve Hızlı Akıncılar',
    descriptionTr: 'Yoğun dönen kaya ve metal parçacıkları arasında manevra yapın. Süratli avcılar dar alanları avantaja çevirmeye çalışır.',
    hazardType: 'asteroid_debris',
    hazardNameTr: 'Kozmik Moloz Akışı',
    hazardDescriptionTr: 'Daralan hareket alanı; hızlı yön değiştirme refleksleri gerektirir.',
    ambientColor: '#047857',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    targetWaves: 3,
    recommendedTrackId: 1, // Siberpunk Aşırı Yükleme
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.0,
    enemyHpMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    starScoreThresholds: [2500, 5500, 9000],
  },
  {
    id: 3,
    code: 'SEKTÖR-03',
    nameTr: 'Mor İyon Yarığı',
    nameEn: 'Violet Ion Rift',
    subtitleTr: 'Kalkan Bozan Elektromanyetik Fırtına',
    descriptionTr: 'İyonik gaz bulutları geminizin kalkan şarj döngüsünü yavaşlatır. Keskin nişancı İHA lar uzak menzilden nişan alır.',
    hazardType: 'ion_disruption',
    hazardNameTr: 'İyon Fırtınası',
    hazardDescriptionTr: 'Kalkan dolum hızı %30 azalır. Atılma manevralarını idareli kullanın.',
    ambientColor: '#7e22ce',
    gridColor: 'rgba(168, 85, 247, 0.09)',
    targetWaves: 4,
    recommendedTrackId: 2, // Hiçlik Dretnotu
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.05,
    enemyHpMultiplier: 1.1,
    spawnRateMultiplier: 1.1,
    starScoreThresholds: [3500, 7500, 12000],
  },
  {
    id: 4,
    code: 'SEKTÖR-04',
    nameTr: 'Güneş Radyasyon Çölü',
    nameEn: 'Solar Flare Expanse',
    subtitleTr: 'Yüksek Isı ve Aşırı Hızlı Çapulcular',
    descriptionTr: 'İkiz yıldızların kor alevleri motor soğutmasını zorlar. Radyasyon altında agresifleşen hücum birlikleri doğrudan üzerinize uçar.',
    hazardType: 'solar_radiation',
    hazardNameTr: 'Güneş Patlamaları',
    hazardDescriptionTr: 'Düşman gemileri %15 daha süratli ve kararlı hücum eder.',
    ambientColor: '#c2410c',
    gridColor: 'rgba(249, 115, 22, 0.09)',
    targetWaves: 4,
    recommendedTrackId: 3, // Yıldız Savaşçısı
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.2,
    enemyHpMultiplier: 1.15,
    spawnRateMultiplier: 1.15,
    starScoreThresholds: [4500, 9500, 15000],
  },
  {
    id: 5,
    code: 'SEKTÖR-05',
    nameTr: 'Siber Kale Alpha',
    nameEn: 'Cyber Citadel Alpha',
    subtitleTr: 'Aegis Muhafız Dretnotu ile Karşılaşma',
    descriptionTr: 'Düşman ana karargahının dış savunma kalesi. Ağır zırhlı "Aegis Sentinel" dretnotu sektör merkezini koruyor.',
    hazardType: 'none',
    hazardNameTr: 'Kale Savunma Şebekesi',
    hazardDescriptionTr: 'Dalga 4 sonrasında ağır korumalı Aegis Dretnotu sahaya iner.',
    ambientColor: '#1e1b4b',
    gridColor: 'rgba(99, 102, 241, 0.11)',
    targetWaves: 4,
    recommendedTrackId: 4, // Omega Çekirdek
    bossArchetype: 'aegis_sentinel',
    bossNameTr: 'AEGIS MUHAFIZ DRETNOTU',
    enemySpeedMultiplier: 1.1,
    enemyHpMultiplier: 1.25,
    spawnRateMultiplier: 1.2,
    starScoreThresholds: [6000, 13000, 20000],
  },
  {
    id: 6,
    code: 'SEKTÖR-06',
    nameTr: 'Kuantum Çöküş Bölgesi',
    nameEn: 'Quantum Singularity Field',
    subtitleTr: 'Uzay-Zaman Eğrilmesi ve Teleport Avcıları',
    descriptionTr: 'Karadelik ufkuna yakın bu bölgede yerçekimi dalgalanır. Keskin nişancılar kuantum sıçramalarıyla aniden yer değiştirir.',
    hazardType: 'quantum_distortion',
    hazardNameTr: 'Kuantum Sapması',
    hazardDescriptionTr: 'Mermiler hafif çekim kavisleri çizer, düşmanlar beklenmedik açılardan yaklaşır.',
    ambientColor: '#0f766e',
    gridColor: 'rgba(20, 184, 166, 0.1)',
    targetWaves: 4,
    recommendedTrackId: 0, // Kozmik Derinlik
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.15,
    enemyHpMultiplier: 1.3,
    spawnRateMultiplier: 1.25,
    starScoreThresholds: [7000, 15000, 24000],
  },
  {
    id: 7,
    code: 'SEKTÖR-07',
    nameTr: 'Terk Edilmiş Dretnot Tersanesi',
    nameEn: 'Derelict Shipyard',
    subtitleTr: 'Zırhlı Çekiç Gemileri ve Dar Savunma',
    descriptionTr: 'Eski savaş gemilerinin enkazları arasında devasa Charger sürüleri pusu kurmuştur. Zırh delici silahlar hayati önem taşır.',
    hazardType: 'asteroid_debris',
    hazardNameTr: 'Enkaz Alanı',
    hazardDescriptionTr: 'Ağır zırhlı Charger düşman sıklığı iki katına çıkar.',
    ambientColor: '#374151',
    gridColor: 'rgba(156, 163, 175, 0.09)',
    targetWaves: 4,
    recommendedTrackId: 2, // Hiçlik Dretnotu
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.18,
    enemyHpMultiplier: 1.4,
    spawnRateMultiplier: 1.3,
    starScoreThresholds: [8500, 18000, 28000],
  },
  {
    id: 8,
    code: 'SEKTÖR-08',
    nameTr: 'Biyolojik Kovan Sürüsü',
    nameEn: 'Bio-Swarm Infestation',
    subtitleTr: 'Durmaksızın Akın Eden Yaratık Sürüsü',
    descriptionTr: 'Organik uzay parazitleri kovan mantığıyla hareket eder. Ekranı kaplayan yüzlerce minik avcıyı savuşturmak için seri atış yapın.',
    hazardType: 'none',
    hazardNameTr: 'Kovan Sürü Baskını',
    hazardDescriptionTr: 'Aşırı yoğun düşman akışı; yüksek kombo ve alan hasarı şarttır.',
    ambientColor: '#831843',
    gridColor: 'rgba(244, 63, 94, 0.1)',
    targetWaves: 5,
    recommendedTrackId: 1, // Siberpunk Aşırı Yükleme
    bossArchetype: 'hive_queen',
    bossNameTr: 'BİYOLOJİK KOVAN KRALİÇESİ',
    enemySpeedMultiplier: 1.3,
    enemyHpMultiplier: 1.25,
    spawnRateMultiplier: 1.5,
    starScoreThresholds: [10000, 22000, 34000],
  },
  {
    id: 9,
    code: 'SEKTÖR-09',
    nameTr: 'Plazma Reaktör Çekirdeği',
    nameEn: 'Plasma Reactor Core',
    subtitleTr: 'Kritik Enerji Boşalımı ve Elit Birlikler',
    descriptionTr: 'Hiçlik istasyonunun reaktör kalbi. Yüksek ısı plazma mermileri her yönden üzerinize akar. Kalkanlarınızı sürekli dolu tutun.',
    hazardType: 'solar_radiation',
    hazardNameTr: 'Reaktör Radyasyonu',
    hazardDescriptionTr: 'Düşman mermileri %20 daha hızlı ve geniş yarıçaplıdır.',
    ambientColor: '#854d0e',
    gridColor: 'rgba(234, 179, 8, 0.1)',
    targetWaves: 5,
    recommendedTrackId: 3, // Yıldız Savaşçısı
    bossArchetype: 'none',
    enemySpeedMultiplier: 1.28,
    enemyHpMultiplier: 1.55,
    spawnRateMultiplier: 1.4,
    starScoreThresholds: [12000, 26000, 40000],
  },
  {
    id: 10,
    code: 'SEKTÖR-10',
    nameTr: 'Hiçlik Titanı Primus',
    nameEn: 'Omega Titan Primus',
    subtitleTr: 'Nihai Galaktik Hesaplaşma & Titan Karşılaşması',
    descriptionTr: 'Galaksiyi tehdit eden Hiçlik Donanması komutanı Omega Titan Primus. Üç kademeli saldırı fazı, EMP patlamaları ve koruma filosu.',
    hazardType: 'gravity_well',
    hazardNameTr: 'Hiçliğin Çekimi',
    hazardDescriptionTr: 'Devasa gravitasyonel çekim; arenada kalmak için devamlı itki uygulayın.',
    ambientColor: '#450a0a',
    gridColor: 'rgba(239, 68, 68, 0.12)',
    targetWaves: 5,
    recommendedTrackId: 4, // Omega Çekirdek
    bossArchetype: 'omega_primus',
    bossNameTr: 'OMEGA TİTAN PRİMUS',
    enemySpeedMultiplier: 1.35,
    enemyHpMultiplier: 1.8,
    spawnRateMultiplier: 1.45,
    starScoreThresholds: [15000, 32000, 50000],
  },
];

const SECTORS_STORAGE_KEY = 'astro_sectors_progress_v2';

export function getDefaultSectorProgress(): SectorProgress[] {
  return CAMPAIGN_SECTORS.map((s, index) => ({
    sectorId: s.id,
    unlocked: index === 0, // Only Sector 1 is unlocked initially
    completed: false,
    stars: 0,
    highScore: 0,
    bestTimeSeconds: 0,
  }));
}

export function loadSavedSectorProgress(): SectorProgress[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultSectorProgress();
  }
  try {
    const raw = window.localStorage.getItem(SECTORS_STORAGE_KEY);
    if (!raw) return getDefaultSectorProgress();
    const parsed = JSON.parse(raw) as SectorProgress[];
    // Ensure all 10 sectors exist
    const defaults = getDefaultSectorProgress();
    return defaults.map((def) => {
      const match = parsed.find((p) => p.sectorId === def.sectorId);
      return match || def;
    });
  } catch {
    return getDefaultSectorProgress();
  }
}

export function saveSectorProgress(progressList: SectorProgress[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SECTORS_STORAGE_KEY, JSON.stringify(progressList));
  } catch {}
}

export function calculateSectorStars(
  score: number,
  hpPercentage: number,
  thresholds: [number, number, number]
): number {
  let stars = 1; // Completed = at least 1 star
  if (score >= thresholds[1] || hpPercentage >= 0.5) {
    stars = 2;
  }
  if (score >= thresholds[2] && hpPercentage >= 0.7) {
    stars = 3;
  }
  return stars;
}

export function recordSectorVictory(
  currentSectorId: number,
  score: number,
  timeSeconds: number,
  hpPercentage: number,
  progressList: SectorProgress[]
): { updatedList: SectorProgress[]; starsEarned: number; nextSectorUnlocked: number | null } {
  const currentDef = CAMPAIGN_SECTORS.find((s) => s.id === currentSectorId);
  const thresholds: [number, number, number] = currentDef
    ? currentDef.starScoreThresholds
    : [2000, 5000, 10000];

  const starsEarned = calculateSectorStars(score, hpPercentage, thresholds);

  let nextSectorUnlocked: number | null = null;
  const updatedList = progressList.map((entry) => {
    if (entry.sectorId === currentSectorId) {
      return {
        ...entry,
        completed: true,
        stars: Math.max(entry.stars, starsEarned),
        highScore: Math.max(entry.highScore, score),
        bestTimeSeconds:
          entry.bestTimeSeconds > 0 ? Math.min(entry.bestTimeSeconds, timeSeconds) : timeSeconds,
      };
    }
    // Unlock next sector
    if (entry.sectorId === currentSectorId + 1 && !entry.unlocked) {
      nextSectorUnlocked = entry.sectorId;
      return {
        ...entry,
        unlocked: true,
      };
    }
    return entry;
  });

  saveSectorProgress(updatedList);
  return { updatedList, starsEarned, nextSectorUnlocked };
}

export function getSectorById(sectorId: number): SectorDef {
  const found = CAMPAIGN_SECTORS.find((s) => s.id === sectorId);
  return found || CAMPAIGN_SECTORS[0];
}
