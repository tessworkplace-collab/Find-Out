from pathlib import Path

path = Path('src/discoveryStorage.ts')
text = path.read_text()

old = """export async function updateCompletedDiscovery(
  id: string,
  input: { observation: string; location: string },
) {
  const existing = await loadCompletedDiscoveries();
  let updated: CompletedDiscovery | null = null;
  const next = existing.map(item => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      observation: input.observation,
      location: input.location,
      editedAt: new Date().toISOString(),
      reviewStatus: 'pending',
      reviewedAt: undefined,
    };
    return updated;
  });

  if (!updated) throw new Error('Discovery not found.');
  await saveCompletedDiscoveries(next);
  return updated;
}

export async function approveCompletedDiscovery(id: string) {
  const existing = await loadCompletedDiscoveries();
  let updated: CompletedDiscovery | null = null;
  const next = existing.map(item => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      reviewStatus: 'approved',
      reviewedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) throw new Error('Discovery not found.');
  await saveCompletedDiscoveries(next);
  return updated;
}
"""

new = """export async function updateCompletedDiscovery(
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
"""

if text.count(old) != 1:
    raise SystemExit(f'review storage fix: expected 1 match, found {text.count(old)}')
path.write_text(text.replace(old, new, 1))
