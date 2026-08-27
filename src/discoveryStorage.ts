import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { EvidenceType, MissionDifficulty, missions } from './data';

export type CompletedEvidence = {
  type: EvidenceType;
  uri: string;
  durationMs?: number;
};

export type ReviewStatus = 'pending' | 'approved';

export type CompletedDiscovery = {
  id: string;
  missionId: string;
  missionTitle: string;
  difficulty: MissionDifficulty;
  evidenceType: EvidenceType;
  observation: string;
  location: string;
  evidence: CompletedEvidence;
  completedAt: string;
  unlockedTrophyIds: string[];
  reviewStatus: ReviewStatus;
  reviewedAt?: string;
  editedAt?: string;
};

type LegacyCompletedDiscovery = Partial<CompletedDiscovery> & {
  id?: string;
  missionId?: string;
  missionTitle?: string;
  category?: string;
  observation?: string;
  location?: string;
  evidence?: CompletedEvidence;
  completedAt?: string;
};

const DISCOVERIES_KEY = 'findout:completed-discoveries:v1';
const DISCOVERIES_DIRECTORY = `${FileSystem.documentDirectory ?? ''}find-out-completed-v1/`;

async function ensureDirectory() {
  if (!FileSystem.documentDirectory) return false;
  await FileSystem.makeDirectoryAsync(DISCOVERIES_DIRECTORY, { intermediates: true });
  return true;
}

function extensionFor(evidence: CompletedEvidence) {
  const match = evidence.uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return `.${match[1].toLowerCase()}`;
  if (evidence.type === 'photo') return '.jpg';
  if (evidence.type === 'video') return '.mp4';
  return '.m4a';
}

async function copyEvidence(evidence: CompletedEvidence, id: string) {
  if (!FileSystem.documentDirectory || evidence.uri.startsWith(DISCOVERIES_DIRECTORY)) {
    return evidence;
  }

  await ensureDirectory();
  const destination = `${DISCOVERIES_DIRECTORY}${id}${extensionFor(evidence)}`;
  await FileSystem.copyAsync({ from: evidence.uri, to: destination });
  return { ...evidence, uri: destination };
}

function isDifficulty(value: unknown): value is MissionDifficulty {
  return value === 'EASY' || value === 'MEDIUM' || value === 'HARD';
}

function normalizeDiscovery(item: LegacyCompletedDiscovery): CompletedDiscovery | null {
  if (!item.id || !item.missionId || !item.evidence?.uri) return null;
  const mission = missions.find(candidate => candidate.id === item.missionId);
  const legacyDifficulty = isDifficulty(item.category) ? item.category : undefined;
  const difficulty = isDifficulty(item.difficulty)
    ? item.difficulty
    : mission?.difficulty ?? legacyDifficulty ?? 'MEDIUM';
  const evidenceType = item.evidenceType ?? item.evidence.type;

  return {
    id: item.id,
    missionId: item.missionId,
    missionTitle: item.missionTitle ?? mission?.title ?? 'Mission',
    difficulty,
    evidenceType,
    observation: item.observation ?? '',
    location: item.location ?? '',
    evidence: item.evidence,
    completedAt: item.completedAt ?? new Date(0).toISOString(),
    unlockedTrophyIds: Array.isArray(item.unlockedTrophyIds) ? item.unlockedTrophyIds : [],
    reviewStatus: item.reviewStatus ?? 'pending',
    reviewedAt: item.reviewedAt,
    editedAt: item.editedAt,
  };
}

export async function loadCompletedDiscoveries(): Promise<CompletedDiscovery[]> {
  try {
    const raw = await AsyncStorage.getItem(DISCOVERIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(item => normalizeDiscovery(item as LegacyCompletedDiscovery))
      .filter((item): item is CompletedDiscovery => Boolean(item));
  } catch {
    return [];
  }
}

async function saveCompletedDiscoveries(items: CompletedDiscovery[]) {
  await AsyncStorage.setItem(DISCOVERIES_KEY, JSON.stringify(items));
}

export async function addCompletedDiscovery(input: {
  missionId: string;
  missionTitle: string;
  difficulty: MissionDifficulty;
  observation: string;
  location: string;
  evidence: CompletedEvidence;
}) {
  const completedAt = new Date().toISOString();
  const id = `${input.missionId}-${Date.now()}`;
  const stableEvidence = await copyEvidence(input.evidence, id);
  const item: CompletedDiscovery = {
    id,
    missionId: input.missionId,
    missionTitle: input.missionTitle,
    difficulty: input.difficulty,
    evidenceType: stableEvidence.type,
    observation: input.observation,
    location: input.location,
    evidence: stableEvidence,
    completedAt,
    unlockedTrophyIds: [],
    reviewStatus: 'pending',
  };

  const existing = await loadCompletedDiscoveries();
  await saveCompletedDiscoveries([item, ...existing]);
  return item;
}

export async function attachUnlockedTrophies(id: string, trophyIds: string[]) {
  if (trophyIds.length === 0) return null;
  const existing = await loadCompletedDiscoveries();
  const index = existing.findIndex(item => item.id === id);
  if (index < 0) return null;
  const updated: CompletedDiscovery = {
    ...existing[index],
    unlockedTrophyIds: Array.from(new Set([...existing[index].unlockedTrophyIds, ...trophyIds])),
  };
  const next = [...existing];
  next[index] = updated;
  await saveCompletedDiscoveries(next);
  return updated;
}

export async function updateCompletedDiscovery(
  id: string,
  input: { observation: string; location: string },
) {
  const existing = await loadCompletedDiscoveries();
  const index = existing.findIndex(item => item.id === id);
  if (index < 0) throw new Error('Discovery not found.');

  const updated: CompletedDiscovery = {
    ...existing[index],
    observation: input.observation,
    location: input.location,
    editedAt: new Date().toISOString(),
    reviewStatus: 'pending',
    reviewedAt: undefined,
  };
  const next = [...existing];
  next[index] = updated;
  await saveCompletedDiscoveries(next);
  return updated;
}

export async function approveCompletedDiscovery(id: string) {
  const existing = await loadCompletedDiscoveries();
  const index = existing.findIndex(item => item.id === id);
  if (index < 0) throw new Error('Discovery not found.');

  const updated: CompletedDiscovery = {
    ...existing[index],
    reviewStatus: 'approved',
    reviewedAt: new Date().toISOString(),
  };
  const next = [...existing];
  next[index] = updated;
  await saveCompletedDiscoveries(next);
  return updated;
}
