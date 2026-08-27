import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletedDiscovery } from './discoveryStorage';

export type TrophyId =
  | 'sharp-observer'
  | 'evidence-keeper'
  | 'pattern-finder'
  | 'night-scout';

export type TrophyDefinition = {
  id: TrophyId;
  title: string;
  description: string;
  hidden: boolean;
};

export type UnlockedTrophy = {
  id: TrophyId;
  unlockedAt: string;
};

export type ProgressionState = {
  unlockedTrophies: UnlockedTrophy[];
  equippedTitleId: TrophyId | null;
};

const PROGRESSION_KEY = 'findout:progression:v1';

export const trophyDefinitions: TrophyDefinition[] = [
  {
    id: 'sharp-observer',
    title: 'Sharp Observer',
    description: 'Document three field discoveries.',
    hidden: false,
  },
  {
    id: 'evidence-keeper',
    title: 'Evidence Keeper',
    description: 'Capture photo, video and audio evidence across your discoveries.',
    hidden: false,
  },
  {
    id: 'pattern-finder',
    title: 'Pattern Finder',
    description: 'Complete four different missions.',
    hidden: false,
  },
  {
    id: 'night-scout',
    title: 'Night Scout',
    description: 'Complete the After Hours mission safely in a publicly accessible setting.',
    hidden: true,
  },
];

const EMPTY_STATE: ProgressionState = {
  unlockedTrophies: [],
  equippedTitleId: null,
};

function isTrophyId(value: unknown): value is TrophyId {
  return trophyDefinitions.some(trophy => trophy.id === value);
}

export async function loadProgression(): Promise<ProgressionState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESSION_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    const unlockedTrophies = Array.isArray(parsed.unlockedTrophies)
      ? parsed.unlockedTrophies.filter(
          item => item && isTrophyId(item.id) && typeof item.unlockedAt === 'string',
        )
      : [];
    const equippedTitleId = isTrophyId(parsed.equippedTitleId) ? parsed.equippedTitleId : null;
    const equippedIsUnlocked = unlockedTrophies.some(item => item.id === equippedTitleId);
    return {
      unlockedTrophies,
      equippedTitleId: equippedIsUnlocked ? equippedTitleId : null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

async function saveProgression(state: ProgressionState) {
  await AsyncStorage.setItem(PROGRESSION_KEY, JSON.stringify(state));
}

function eligibleTrophyIds(discoveries: CompletedDiscovery[]): TrophyId[] {
  const evidenceTypes = new Set(discoveries.map(item => item.evidenceType));
  const missionIds = new Set(discoveries.map(item => item.missionId));
  const result: TrophyId[] = [];

  if (discoveries.length >= 3) result.push('sharp-observer');
  if (evidenceTypes.has('photo') && evidenceTypes.has('video') && evidenceTypes.has('audio')) {
    result.push('evidence-keeper');
  }
  if (missionIds.size >= 4) result.push('pattern-finder');
  if (discoveries.some(item => item.missionId === 'after-hours')) result.push('night-scout');

  return result;
}

export async function unlockEligibleTrophies(discoveries: CompletedDiscovery[]) {
  const state = await loadProgression();
  const existing = new Set(state.unlockedTrophies.map(item => item.id));
  const now = new Date().toISOString();
  const newlyUnlocked = eligibleTrophyIds(discoveries).filter(id => !existing.has(id));

  if (newlyUnlocked.length === 0) {
    return { state, newlyUnlocked: [] as UnlockedTrophy[] };
  }

  const unlocks = newlyUnlocked.map(id => ({ id, unlockedAt: now }));
  const next: ProgressionState = {
    ...state,
    unlockedTrophies: [...state.unlockedTrophies, ...unlocks],
  };
  await saveProgression(next);
  return { state: next, newlyUnlocked: unlocks };
}

export async function equipTitle(id: TrophyId | null) {
  const state = await loadProgression();
  if (id && !state.unlockedTrophies.some(item => item.id === id)) {
    throw new Error('This title is still locked.');
  }
  const next = { ...state, equippedTitleId: id };
  await saveProgression(next);
  return next;
}

export function trophyById(id: string) {
  return trophyDefinitions.find(trophy => trophy.id === id);
}
