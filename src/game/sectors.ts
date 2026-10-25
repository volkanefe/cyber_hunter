// Campaign Sector definitions, progression rules, and local storage persistence

export type SectorHazardType =
  | 'none'
  | 'asteroid_debris'
  | 'ion_disruption'
  | 'solar_radiation'
  | 'gravity_well'
  | 'quantum_distortion';

export interface SectorNebulaDef {
  xPct: number;
  yPct: number;
  r: number;
  color: string;
}

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
  bgGradient: [string, string]; // [inner cosmic center, outer void boundary]
  starTint: string;
  nebulae: SectorNebulaDef[];
  targetWaves: number;
  recommendedTrackId: number; // 0 to 4
  bossArchetype: 'aegis_sentinel' | 'titan_boss' | 'hive_queen' | 'omega_primus';
  bossNameTr: string;
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
    descriptionTr: 'Federasyonun sınır karakolu. Hafif İHA sürülerini temizleyin; bölüm sonunda Güneş Koruma Titanı nöbettedir.',
    hazardType: 'none',
    hazardNameTr: 'Güvenli Bölge',
    hazardDescriptionTr: 'Aktif çevresel tehdit yok. Temel savaş ve boss taktiği eğitimi.',
    ambientColor: '#0369a1',
    gridColor: 'rgba(6, 182, 212, 0.08)',
    bgGradient: ['#071938', '#010512'],
    starTint: '#e0f2fe',
    nebulae: [
      { xPct: 0.22, yPct: 0.28, r: 340, color: 'rgba(6, 182, 212, 0.16)' },
      { xPct: 0.78, yPct: 0.72, r: 380, color: 'rgba(59, 130, 246, 0.14)' },
      { xPct: 0.45, yPct: 0.82, r: 260, color: 'rgba(14, 165, 233, 0.12)' },
    ],
    targetWaves: 3,
    recommendedTrackId: 0, // Kozmik Derinlik
    bossArchetype: 'titan_boss',
    bossNameTr: 'GÜNEŞ KORUMA TİTANI',
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
    descriptionTr: 'Dönen yeşim mineral tozları ve metal kalıntıları arasında manevra yapın. Kuşağı Altın Krynn Titanı koruyor.',
    hazardType: 'asteroid_debris',
    hazardNameTr: 'Kozmik Moloz Akışı',
    hazardDescriptionTr: 'Daralan hareket alanı; hızlı yön değiştirme refleksleri gerektirir.',
    ambientColor: '#047857',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    bgGradient: ['#052e16', '#010d07'],
    starTint: '#d1fae5',
    nebulae: [
      { xPct: 0.18, yPct: 0.35, r: 320, color: 'rgba(16, 185, 129, 0.18)' },
      { xPct: 0.72, yPct: 0.65, r: 360, color: 'rgba(5, 150, 105, 0.15)' },
      { xPct: 0.48, yPct: 0.22, r: 280, color: 'rgba(52, 211, 153, 0.12)' },
    ],
    targetWaves: 3,
    recommendedTrackId: 1, // Siberpunk Aşırı Yükleme
    bossArchetype: 'titan_boss',
    bossNameTr: 'KRYNN ALTIN GÖZETLEYİCİSİ',
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
    descriptionTr: 'İyonik mor gaz bulutları kalkan şarj döngüsünü yavaşlatır. Yarığın çıkışını devasa İlyon Altın Kalkanı tutmaktadır.',
    hazardType: 'ion_disruption',
    hazardNameTr: 'İyon Fırtınası',
    hazardDescriptionTr: 'Kalkan dolum hızı %30 azalır. Atılma manevralarını idareli kullanın.',
    ambientColor: '#7e22ce',
    gridColor: 'rgba(168, 85, 247, 0.09)',
    bgGradient: ['#28084a', '#080114'],
    starTint: '#f3e8ff',
    nebulae: [
      { xPct: 0.25, yPct: 0.2, r: 350, color: 'rgba(168, 85, 247, 0.20)' },
      { xPct: 0.75, yPct: 0.75, r: 390, color: 'rgba(192, 132, 252, 0.15)' },
      { xPct: 0.5, yPct: 0.55, r: 300, color: 'rgba(236, 72, 153, 0.12)' },
    ],
    targetWaves: 4,
    recommendedTrackId: 2, // Hiçlik Dretnotu
    bossArchetype: 'aegis_sentinel',
    bossNameTr: 'İLYON ALTIN KALKANI',
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
    descriptionTr: 'Kavurucu kızıl-turuncu güneş plazmaları uzayı aydınlatıyor. Bölüm sonu Solar Flare Altın Dretnotu koridorları ateşe verir.',
    hazardType: 'solar_radiation',
    hazardNameTr: 'Güneş Patlamaları',
    hazardDescriptionTr: 'Düşman gemileri %15 daha süratli ve kararlı hücum eder.',
    ambientColor: '#c2410c',
    gridColor: 'rgba(249, 115, 22, 0.09)',
    bgGradient: ['#431407', '#120300'],
    starTint: '#ffedd5',
    nebulae: [
      { xPct: 0.3, yPct: 0.25, r: 370, color: 'rgba(249, 115, 22, 0.22)' },
      { xPct: 0.8, yPct: 0.7, r: 390, color: 'rgba(234, 88, 12, 0.17)' },
      { xPct: 0.45, yPct: 0.85, r: 270, color: 'rgba(250, 204, 21, 0.15)' },
    ],
    targetWaves: 4,
    recommendedTrackId: 3, // Yıldız Savaşçısı
    bossArchetype: 'titan_boss',
    bossNameTr: 'SOLAR FLARE ALTIN DRETNOTU',
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
    subtitleTr: 'Aegis Altın Bastionu ile Karşılaşma',
    descriptionTr: 'Düşman ana karargahının dış savunma kalesi. Ağır altın zırhlı "Aegis Bastionu" sektör merkezini koruyor.',
    hazardType: 'none',
    hazardNameTr: 'Kale Savunma Şebekesi',
    hazardDescriptionTr: 'Dalga 4 sonrasında ağır altın korumalı Aegis Dretnotu sahaya iner.',
    ambientColor: '#1e1b4b',
    gridColor: 'rgba(99, 102, 241, 0.11)',
    bgGradient: ['#1e1b4b', '#05041a'],
    starTint: '#e0e7ff',
    nebulae: [
      { xPct: 0.2, yPct: 0.3, r: 350, color: 'rgba(99, 102, 241, 0.19)' },
      { xPct: 0.75, yPct: 0.65, r: 400, color: 'rgba(79, 70, 229, 0.15)' },
      { xPct: 0.5, yPct: 0.85, r: 280, color: 'rgba(34, 211, 238, 0.12)' },
    ],
    targetWaves: 4,
    recommendedTrackId: 4, // Omega Çekirdek
    bossArchetype: 'aegis_sentinel',
    bossNameTr: 'AEGIS ALTIN BASTİONU',
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
    subtitleTr: 'Uzay-Zaman Eğrilmesi ve Kuantum Altın Tekilliği',
    descriptionTr: 'Karadelik ufkuna yakın akuamarin ve turkuaz kuantum alanı. Bölüm sonunda Kuantum Altın Tekilliği devasa yerçekimsel patlamalar saçar.',
    hazardType: 'quantum_distortion',
    hazardNameTr: 'Kuantum Sapması',
    hazardDescriptionTr: 'Mermiler hafif çekim kavisleri çizer, düşmanlar beklenmedik açılardan yaklaşır.',
    ambientColor: '#0f766e',
    gridColor: 'rgba(20, 184, 166, 0.1)',
    bgGradient: ['#042f2e', '#010d0d'],
    starTint: '#ccfbf1',
    nebulae: [
      { xPct: 0.25, yPct: 0.22, r: 360, color: 'rgba(20, 184, 166, 0.20)' },
      { xPct: 0.75, yPct: 0.72, r: 380, color: 'rgba(13, 148, 136, 0.16)' },
      { xPct: 0.45, yPct: 0.45, r: 290, color: 'rgba(45, 212, 191, 0.13)' },
    ],
    targetWaves: 4,
    recommendedTrackId: 0, // Kozmik Derinlik
    bossArchetype: 'titan_boss',
    bossNameTr: 'KUANTUM ALTIN TEKİLLİĞİ',
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
    subtitleTr: 'Enkaz Altın Leviathanı ile Karşılaşma',
    descriptionTr: 'Eski savaş gemilerinin paslı kömür karası enkazları arasında devasa Enkaz Altın Leviathanı beklemektedir.',
    hazardType: 'asteroid_debris',
    hazardNameTr: 'Enkaz Alanı',
    hazardDescriptionTr: 'Ağır zırhlı Charger düşman sıklığı iki katına çıkar.',
    ambientColor: '#374151',
    gridColor: 'rgba(156, 163, 175, 0.09)',
    bgGradient: ['#1c1917', '#080706'],
    starTint: '#f5f5f4',
    nebulae: [
      { xPct: 0.28, yPct: 0.32, r: 340, color: 'rgba(180, 83, 9, 0.17)' },
      { xPct: 0.7, yPct: 0.65, r: 380, color: 'rgba(120, 113, 108, 0.18)' },
      { xPct: 0.4, yPct: 0.8, r: 270, color: 'rgba(217, 119, 6, 0.13)' },
    ],
    targetWaves: 4,
    recommendedTrackId: 2, // Hiçlik Dretnotu
    bossArchetype: 'titan_boss',
    bossNameTr: 'ENKAZ ALTIN LEVİATHANI',
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
    subtitleTr: 'Altın Kovan Kraliçesi ile Karşılaşma',
    descriptionTr: 'Gül kurusu ve karmen renkli organik uzay parazitleri. Bölüm sonunda devasa Altın Kovan Kraliçesi sahaya hükmeder.',
    hazardType: 'none',
    hazardNameTr: 'Kovan Sürü Baskını',
    hazardDescriptionTr: 'Aşırı yoğun düşman akışı; yüksek kombo ve alan hasarı şarttır.',
    ambientColor: '#831843',
    gridColor: 'rgba(244, 63, 94, 0.1)',
    bgGradient: ['#4c0519', '#120106'],
    starTint: '#ffe4e6',
    nebulae: [
      { xPct: 0.22, yPct: 0.25, r: 350, color: 'rgba(244, 63, 94, 0.21)' },
      { xPct: 0.78, yPct: 0.7, r: 400, color: 'rgba(225, 29, 72, 0.17)' },
      { xPct: 0.5, yPct: 0.5, r: 280, color: 'rgba(251, 113, 133, 0.13)' },
    ],
    targetWaves: 5,
    recommendedTrackId: 1, // Siberpunk Aşırı Yükleme
    bossArchetype: 'hive_queen',
    bossNameTr: 'ALTIN KOVAN KRALİÇESİ',
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
    subtitleTr: 'Plazma Altın Reaktörü Titanı',
    descriptionTr: 'Altın sarısı ve akkor kehribar reaktör kalbi. Yüksek ısı plazma saçan Plazma Altın Reaktörü ölümcül mermi dalgaları kusar.',
    hazardType: 'solar_radiation',
    hazardNameTr: 'Reaktör Radyasyonu',
    hazardDescriptionTr: 'Düşman mermileri %20 daha hızlı ve geniş yarıçaplıdır.',
    ambientColor: '#854d0e',
    gridColor: 'rgba(234, 179, 8, 0.1)',
    bgGradient: ['#451a03', '#0e0400'],
    starTint: '#fef9c3',
    nebulae: [
      { xPct: 0.25, yPct: 0.3, r: 360, color: 'rgba(234, 179, 8, 0.23)' },
      { xPct: 0.75, yPct: 0.7, r: 410, color: 'rgba(245, 158, 11, 0.19)' },
      { xPct: 0.45, yPct: 0.78, r: 290, color: 'rgba(253, 224, 71, 0.16)' },
    ],
    targetWaves: 5,
    recommendedTrackId: 3, // Yıldız Savaşçısı
    bossArchetype: 'titan_boss',
    bossNameTr: 'PLAZMA ALTIN REAKTÖRÜ',
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
    subtitleTr: 'Nihai Altın Omega Primus Karşılaşması',
    descriptionTr: 'Karanlık mor ve altın auralı devasa Hiçlik Donanması komutanı Altın Omega Primus. Çift kademeli altın güneş fırtınası ve yıkıcı plazma yağmuru.',
    hazardType: 'gravity_well',
    hazardNameTr: 'Hiçliğin Çekimi',
    hazardDescriptionTr: 'Devasa gravitasyonel çekim; arenada kalmak için devamlı itki uygulayın.',
    ambientColor: '#450a0a',
    gridColor: 'rgba(239, 68, 68, 0.12)',
    bgGradient: ['#3b0764', '#040108'],
    starTint: '#faf5ff',
    nebulae: [
      { xPct: 0.2, yPct: 0.25, r: 380, color: 'rgba(147, 51, 234, 0.21)' },
      { xPct: 0.8, yPct: 0.75, r: 430, color: 'rgba(239, 68, 68, 0.19)' },
      { xPct: 0.5, yPct: 0.5, r: 320, color: 'rgba(250, 204, 21, 0.15)' },
    ],
    targetWaves: 5,
    recommendedTrackId: 4, // Omega Çekirdek
    bossArchetype: 'omega_primus',
    bossNameTr: 'ALTIN OMEGA PRİMUS TİTANI',
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
