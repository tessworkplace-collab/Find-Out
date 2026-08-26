import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export type PersistedEvidence = {
  type: 'photo' | 'video' | 'audio';
  uri: string;
  durationMs?: number;
};

export type DraftSnapshot = {
  screen: string;
  captureMode: 'photo' | 'video' | 'audio';
  evidence: PersistedEvidence | null;
  highestStep: number;
  submitted: boolean;
  observation: string;
  location: string;
  updatedAt: string;
};

const DRAFT_KEY = 'findout:draft:v1';
const DRAFT_DIRECTORY = `${FileSystem.documentDirectory ?? ''}find-out-drafts/`;

function extensionFor(type: PersistedEvidence['type'], uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return `.${match[1].toLowerCase()}`;
  if (type === 'photo') return '.jpg';
  if (type === 'video') return '.mp4';
  return '.m4a';
}

export async function persistEvidenceFile(evidence: PersistedEvidence) {
  if (!FileSystem.documentDirectory || evidence.uri.startsWith(DRAFT_DIRECTORY)) {
    return evidence;
  }

  await FileSystem.makeDirectoryAsync(DRAFT_DIRECTORY, { intermediates: true });
  const destination = `${DRAFT_DIRECTORY}evidence-${Date.now()}${extensionFor(
    evidence.type,
    evidence.uri,
  )}`;
  await FileSystem.copyAsync({ from: evidence.uri, to: destination });
  return { ...evidence, uri: destination };
}

export async function removePersistedEvidence(evidence: PersistedEvidence | null) {
  if (!evidence?.uri || !evidence.uri.startsWith(DRAFT_DIRECTORY)) return;
  await FileSystem.deleteAsync(evidence.uri, { idempotent: true });
}

export async function loadDraft(): Promise<DraftSnapshot | null> {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as DraftSnapshot;
    if (draft.evidence?.uri) {
      const info = await FileSystem.getInfoAsync(draft.evidence.uri);
      if (!info.exists) draft.evidence = null;
    }
    return draft;
  } catch {
    await AsyncStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

export async function saveDraft(snapshot: Omit<DraftSnapshot, 'updatedAt'>) {
  const draft: DraftSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function clearDraft(evidence?: PersistedEvidence | null) {
  await AsyncStorage.removeItem(DRAFT_KEY);
  if (evidence) await removePersistedEvidence(evidence);
}
