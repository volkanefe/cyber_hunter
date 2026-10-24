import { ActiveMissionBuffs, DailyMission, MissionEvent } from './types';

export function getTodayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultDailyMissions(dateKey: string = getTodayDateKey()): DailyMission[] {
  // 4 varied daily missions including the user's explicit requests:
  // 'destroy 50 enemies' and 'survive for 5 minutes' (300 seconds)
  return [
    {
      id: `m_kills_${dateKey}`,
      type: 'kill_count',
      titleTr: 'Düşman İmhası',
      titleEn: 'Enemy Elimination',
      descriptionTr: '50 düşman gemisini yok edin.',
      descriptionEn: 'Destroy 50 enemy ships.',
      target: 50,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'score_multiplier',
        labelTr: '+%35 Skor Çarpanı',
        labelEn: '+35% Score Multiplier',
        value: 0.35,
        descriptionTr: 'Tüm skor kazanımlarını %35 artırır.',
      },
      icon: 'crosshair',
    },
    {
      id: `m_survive_${dateKey}`,
      type: 'survival_time',
      titleTr: 'Hayatta Kalma Uzmanı',
      titleEn: 'Survivalist',
      descriptionTr: 'Arenada 5 dakika (300 saniye) boyunca hayatta kalın.',
      descriptionEn: 'Survive in the arena for 5 minutes (300 seconds).',
      target: 300,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'shield_boost',
        labelTr: '+35 Aşırı Yüklü Kalkan',
        labelEn: '+35 Overcharged Shield',
        value: 35,
        descriptionTr: 'Gemi kalkan kapasitesine +35 ek kalkan ekler.',
      },
      icon: 'clock',
    },
    {
      id: `m_combo_${dateKey}`,
      type: 'reach_combo',
      titleTr: 'Kombo Ustası',
      titleEn: 'Combo Master',
      descriptionTr: 'Kesintisiz 12x kombo serisine ulaşın.',
      descriptionEn: 'Reach a streak of 12x combo.',
      target: 12,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'speed_boost',
        labelTr: '+%20 İtiş Hızı',
        labelEn: '+20% Thrust Speed',
        value: 0.2,
        descriptionTr: 'Gemi hızını ve manevra kabiliyetini %20 artırır.',
      },
      icon: 'zap',
    },
    {
      id: `m_gems_${dateKey}`,
      type: 'collect_gems',
      titleTr: 'Enerji Toplayıcı',
      titleEn: 'Energy Harvester',
      descriptionTr: 'Arenadan 40 enerji veya onarım küresi toplayın.',
      descriptionEn: 'Collect 40 energy or repair gems from the arena.',
      target: 40,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'damage_boost',
        labelTr: '+%25 Plazma Hasarı',
        labelEn: '+25% Plasma Damage',
        value: 0.25,
        descriptionTr: 'Tüm plazma ve füze atışlarının hasarını %25 artırır.',
      },
      icon: 'award',
      category: 'daily',
    },
    {
      id: `m_planet_explore_${dateKey}`,
      type: 'explore_planet',
      titleTr: 'Gezegen Yörünge Keşfi',
      titleEn: 'Planetary Exploration',
      descriptionTr: 'Uzay arenasında bulunan 3 farklı gezegenin yörüngesine girip tarama tamamlayın.',
      descriptionEn: 'Enter orbit and complete scans of 3 celestial planets in the arena.',
      target: 3,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'score_multiplier',
        labelTr: '+%40 Galaksi Skor Bonusu',
        labelEn: '+40% Galaxy Score Bonus',
        value: 0.4,
        descriptionTr: 'Gezegen araştırması sayesinde tüm skorlara +%40 çarpan ekler.',
      },
      icon: 'globe',
      category: 'celestial_exploration',
    },
    {
      id: `m_titan_boss_${dateKey}`,
      type: 'defeat_boss',
      titleTr: 'Titan Muhafızı Avı',
      titleEn: 'Titan Warden Hunt',
      descriptionTr: '5. Sektördeki devasa Titan Void Muhafızı bossunu yok edin.',
      descriptionEn: 'Vanquish the massive Titan Void Warden boss at Wave 5.',
      target: 1,
      current: 0,
      completed: false,
      claimed: false,
      reward: {
        type: 'damage_boost',
        labelTr: '+%30 Titan Aşırı Yükü',
        labelEn: '+30% Titan Overcharge',
        value: 0.3,
        descriptionTr: 'Titan çekirdeğinden kazanılan enerjiyle mermi hasarını %30 artırır.',
      },
      icon: 'star',
      category: 'sector_bounty',
    },
  ];
}

export function updateMissionProgress(
  missions: DailyMission[],
  event: MissionEvent
): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
  const newlyCompleted: DailyMission[] = [];

  const updatedMissions = missions.map((mission) => {
    if (mission.completed) return mission;

    let newCurrent = mission.current;

    switch (event.type) {
      case 'enemy_killed':
        if (mission.type === 'kill_count') {
          newCurrent += event.count ?? 1;
        }
        break;

      case 'time_survived':
        if (mission.type === 'survival_time') {
          newCurrent = Math.max(mission.current, Math.floor(event.seconds));
        }
        break;

      case 'combo_reached':
        if (mission.type === 'reach_combo') {
          newCurrent = Math.max(mission.current, event.combo);
        }
        break;

      case 'gem_collected':
        if (mission.type === 'collect_gems') {
          newCurrent += event.count ?? 1;
        }
        break;

      case 'wave_cleared':
        if (mission.type === 'clear_waves') {
          newCurrent = Math.max(mission.current, event.wave);
        }
        break;

      case 'planet_scanned':
        if (mission.type === 'explore_planet') {
          newCurrent += 1;
        }
        break;

      case 'boss_defeated':
        if (mission.type === 'defeat_boss') {
          newCurrent += 1;
        }
        break;
    }

    const isNowCompleted = newCurrent >= mission.target;
    if (isNowCompleted && !mission.completed) {
      const completedMission = {
        ...mission,
        current: Math.min(newCurrent, mission.target),
        completed: true,
      };
      newlyCompleted.push(completedMission);
      return completedMission;
    }

    return {
      ...mission,
      current: newCurrent,
    };
  });

  return { updatedMissions, newlyCompleted };
}

export function claimMissionReward(missions: DailyMission[], missionId: string): DailyMission[] {
  return missions.map((m) => {
    if (m.id === missionId && m.completed) {
      return { ...m, claimed: true };
    }
    return m;
  });
}

export function calculateActiveMissionBuffs(missions: DailyMission[]): ActiveMissionBuffs {
  const buffs: ActiveMissionBuffs = {
    scoreMultiplier: 1.0,
    bonusMaxHp: 0,
    bonusMaxShield: 0,
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
  };

  for (const m of missions) {
    // Buff is active once completed (or claimed)
    if (m.completed) {
      switch (m.reward.type) {
        case 'score_multiplier':
          buffs.scoreMultiplier += m.reward.value;
          break;
        case 'shield_boost':
          buffs.bonusMaxShield += m.reward.value;
          break;
        case 'speed_boost':
          buffs.speedMultiplier += m.reward.value;
          break;
        case 'damage_boost':
          buffs.damageMultiplier += m.reward.value;
          break;
      }
    }
  }

  return buffs;
}

export function loadSavedMissions(): DailyMission[] {
  if (typeof window === 'undefined') {
    return getDefaultDailyMissions();
  }
  const dateKey = getTodayDateKey();
  const storageKey = `siber_avci_daily_missions_${dateKey}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  const defaults = getDefaultDailyMissions(dateKey);
  saveMissions(defaults, dateKey);
  return defaults;
}

export function saveMissions(missions: DailyMission[], dateKey: string = getTodayDateKey()): void {
  if (typeof window === 'undefined') return;
  const storageKey = `siber_avci_daily_missions_${dateKey}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(missions));
  } catch {}
}
