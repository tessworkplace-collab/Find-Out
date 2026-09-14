// IndexedDB stores actual evidence, not expiring object URLs or demo placeholders.
export type WebEvidence = { uri: string; type: 'photo' | 'video' | 'audio'; name: string };
export type WebDiscovery = {
  id: string; missionId: string; evidenceType: WebEvidence['type']; title: string;
  note: string; location: string; completedAt: string; day: string; mediaUri?: string;
  evidence: WebEvidence;
};
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('findout-web', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other Find Out tabs and try again.'));
  });
}
export async function readWebState<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction('state', 'readonly');
      const request = tx.objectStore('state').get(key);
      tx.oncomplete = () => resolve(request.result as T | undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
let writes: Promise<void> = Promise.resolve();
function writeEntries(entries: [string, unknown][]): Promise<void> {
  const task = writes.catch(() => undefined).then(async () => {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('state', 'readwrite');
        for (const [key, value] of entries) tx.objectStore('state').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('Could not save. Check browser storage space.'));
      });
    } finally { db.close(); }
  });
  writes = task;
  return task;
}
export function writeWebState(key: string, value: unknown): Promise<void> {
  return writeEntries([[key, value]]);
}
export function commitWebDiscovery(items: WebDiscovery[]): Promise<void> {
  // A reload must never restore an already submitted draft.
  return writeEntries([['discoveries', items], ['draft', null]]);
}
