import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export type CompletedEvidence = {
  type: 'photo' | 'video' | 'audio';
  uri: string;
  durationMs?: number;
};

export type ReviewStatus = 'pending' | 'approved';

export type CompletedDiscovery = {
  id: string;
  missionId: string;
  missionTitle: string;
  category: string;
  observation: string;
  location: string;
  evidence: CompletedEvidence;
  completedAt: string;
  reviewStatus: ReviewStatus;
  reviewedAt?: string;
  editedAt?: string;
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

export async function loadCompletedDiscoveries(): Promise<CompletedDiscovery[]> {
  try {
    const raw = await AsyncStorage.getItem(DISCOVERIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as CompletedDiscovery[]).map(item => ({
          ...item,
          reviewStatus: item.reviewStatus ?? 'pending',
        }))
      : [];
  } catch {
    return [];
  }
}

export async function addCompletedDiscovery(input: {
  missionId: string;
  missionTitle: string;
  category: string;
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
    category: input.category,
    observation: input.observation,
    location: input.location,
    evidence: stableEvidence,
    completedAt,
    reviewStatus: 'pending',
  };

  const existing = await loadCompletedDiscoveries();
  await AsyncStorage.setItem(DISCOVERIES_KEY, JSON.stringify([item, ...existing]));
  return item;
}


async function saveCompletedDiscoveries(items: CompletedDiscovery[]) {
  await AsyncStorage.setItem(DISCOVERIES_KEY, JSON.stringify(items));
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
