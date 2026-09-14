import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUserPreferences } from './preferencesStorage';

const URL = 'https://rnmighiinkzmdxfhnltk.supabase.co';
const KEY = 'sb_publishable_DDp7EoxrwMKg1e_MawxWRA_7nNHcjSs';
const headers = { apikey: KEY, 'Content-Type': 'application/json' };
export type CommunityDiscovery = { id: string; mission_title: string; observation: string; location: string | null; author_name: string; created_at: string };
export type Publication = { id: string; missionTitle: string; observation: string; location: string };
type Receipt = { remoteId: string; synced: boolean };
const RECEIPTS = 'findout:publication-receipts:v1';
let queue: Promise<unknown> = Promise.resolve();
const inFlight = new Map<string, Promise<void>>();

async function receipts(): Promise<Record<string, Receipt>> {
  const raw = await AsyncStorage.getItem(RECEIPTS);
  return raw ? JSON.parse(raw) : {};
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const n = Math.floor(Math.random() * 16);
    return (c === 'x' ? n : (n & 3) | 8).toString(16);
  });
}
function updateReceipt(id: string, synced?: boolean): Promise<Receipt> {
  const task = queue.catch(() => undefined).then(async () => {
    const all = await receipts();
    const receipt = all[id] ?? { remoteId: uuid(), synced: false };
    if (synced !== undefined) receipt.synced = synced;
    all[id] = receipt;
    // Persist identity BEFORE sending: retries after a timeout reuse the same primary key.
    await AsyncStorage.setItem(RECEIPTS, JSON.stringify(all));
    return receipt;
  });
  queue = task;
  return task;
}
async function request(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(URL + '/rest/v1/community_discoveries' + path, {
      ...init, headers: { ...headers, ...init?.headers }, signal: controller.signal,
    });
  } finally { clearTimeout(timer); }
}
export async function isPublished(id: string) {
  await queue.catch(() => undefined);
  return Boolean((await receipts())[id]?.synced);
}
export function publishDiscovery(item: Publication): Promise<void> {
  const existing = inFlight.get(item.id);
  if (existing) return existing;
  const task = (async () => {
    if (!item.observation.trim() || item.observation.length > 600) {
      throw new Error('Use an observation between 1 and 600 characters.');
    }
    const receipt = await updateReceipt(item.id);
    if (receipt.synced) return;
    const preferences = await loadUserPreferences();
    const response = await request('', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ id: receipt.remoteId, mission_title: item.missionTitle,
        observation: item.observation, location: item.location || null,
        author_name: preferences.displayName || 'Explorer' }),
    });
    if (response.status === 409) {
      // A previous request may have committed even if its response was lost.
      const check = await request('?select=id,mission_title,observation&id=eq.' + receipt.remoteId);
      if (!check.ok) throw new Error('Could not confirm publication. Retry when connected.');
      const rows: CommunityDiscovery[] = await check.json();
      if (!rows.some(row => row.id === receipt.remoteId && row.mission_title === item.missionTitle && row.observation === item.observation)) {
        throw new Error('Could not confirm publication. Retry when connected.');
      }
    } else if (!response.ok) {
      throw new Error('Saved on this device. Community upload failed; please retry.');
    }
    await updateReceipt(item.id, true);
  })().finally(() => { inFlight.delete(item.id); });
  inFlight.set(item.id, task);
  return task;
}
export async function loadCommunityDiscoveries(missionTitle: string): Promise<CommunityDiscovery[]> {
  await queue.catch(() => undefined);
  const ownIds = Object.values(await receipts()).map(item => item.remoteId);
  const params = new URLSearchParams({
    select: 'id,mission_title,observation,location,author_name,created_at',
    mission_title: 'eq.' + missionTitle, order: 'created_at.desc', limit: '50',
  });
  if (ownIds.length) params.set('id', 'not.in.(' + ownIds.join(',') + ')');
  const response = await request('?' + params.toString());
  if (!response.ok) throw new Error('Could not load discoveries. Please retry.');
  return response.json();
}
