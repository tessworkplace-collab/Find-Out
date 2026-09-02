import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export type PersistedEvidence = {
  type: 'photo' | 'video' | 'audio';
  uri: string;
  durationMs?: number;
};

export type DraftSnapshot = {
  missionId?: string;
  remixId?: string;
  screen: string;
  captureMode: 'photo' | 'video' | 'audio';
  evidence: PersistedEvidence | null;
  highestStep: number;
  submitted: boolean;
  observation: string;
  location: string;
  updatedAt: string;
};

// v3 intentionally ignores the earlier race-prone draft format.
const DRAFT_KEY = 'findout:draft:v3';
const DRAFT_DIRECTORY = `${FileSystem.documentDirectory ?? ''}find-out-drafts-v3/`;
const DRAFT_FILE = `${DRAFT_DIRECTORY}draft.json`;

// Keep writes strictly ordered. Without this, several autosaves fired close together
// can finish out of order and an older Mission snapshot can overwrite a newer
// Document snapshot just before Expo Go is closed.
let writeQueue: Promise<void> = Promise.resolve();

function extensionFor(type: PersistedEvidence['type'], uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return `.${match[1].toLowerCase()}`;
  if (type === 'photo') return '.jpg';
  if (type === 'video') return '.mp4';
  return '.m4a';
}

async function ensureDraftDirectory() {
  if (!FileSystem.documentDirectory) return false;
  await FileSystem.makeDirectoryAsync(DRAFT_DIRECTORY, { intermediates: true });
  return true;
}

function parseDraft(raw: string | null): DraftSnapshot | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftSnapshot;
  } catch {
    return null;
  }
}

async function validateEvidence(draft: DraftSnapshot | null) {
  if (!draft?.evidence?.uri) return draft;

  try {
    const info = await FileSystem.getInfoAsync(draft.evidence.uri);
    if (!info.exists) draft.evidence = null;
  } catch {
    // Keep the stored URI if the file system cannot inspect it right now.
  }

  return draft;
}

export async function persistEvidenceFile(evidence: PersistedEvidence) {
  if (!FileSystem.documentDirectory || evidence.uri.startsWith(DRAFT_DIRECTORY)) {
    return evidence;
  }

  await ensureDraftDirectory();
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
  // Wait for any in-flight save before reading. This matters during fast refreshes
  // and quick Expo Go background/foreground cycles.
  await writeQueue.catch(() => undefined);

  let asyncDraft: DraftSnapshot | null = null;
  let fileDraft: DraftSnapshot | null = null;

  try {
    asyncDraft = parseDraft(await AsyncStorage.getItem(DRAFT_KEY));
  } catch {
    // File-backed draft below is the fallback when AsyncStorage is unavailable.
  }

  if (FileSystem.documentDirectory) {
    try {
      const info = await FileSystem.getInfoAsync(DRAFT_FILE);
      if (info.exists) {
        fileDraft = parseDraft(await FileSystem.readAsStringAsync(DRAFT_FILE));
      }
    } catch {
      // Ignore a missing/corrupt file and fall back to AsyncStorage.
    }
  }

  const candidates = [asyncDraft, fileDraft].filter(Boolean) as DraftSnapshot[];
  if (!candidates.length) return null;

  candidates.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return validateEvidence(candidates[0]);
}

async function writeDraftNow(draft: DraftSnapshot) {
  const raw = JSON.stringify(draft);
  const writes: Promise<unknown>[] = [AsyncStorage.setItem(DRAFT_KEY, raw)];

  if (FileSystem.documentDirectory) {
    writes.push(
      (async () => {
        await ensureDraftDirectory();
        await FileSystem.writeAsStringAsync(DRAFT_FILE, raw);
      })(),
    );
  }

  const results = await Promise.allSettled(writes);
  if (results.every(result => result.status === 'rejected')) {
    throw new Error('Could not save draft to local storage.');
  }
}

export function saveDraft(snapshot: Omit<DraftSnapshot, 'updatedAt'>) {
  const draft: DraftSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => writeDraftNow(draft));

  return writeQueue;
}

export function clearDraft(evidence?: PersistedEvidence | null) {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await Promise.allSettled([
        AsyncStorage.removeItem(DRAFT_KEY),
        FileSystem.documentDirectory
          ? FileSystem.deleteAsync(DRAFT_FILE, { idempotent: true })
          : Promise.resolve(),
      ]);

      if (evidence) await removePersistedEvidence(evidence);
    });

  return writeQueue;
}
