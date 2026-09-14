const URL = 'https://rnmighiinkzmdxfhnltk.supabase.co';
const KEY = 'sb_publishable_DDp7EoxrwMKg1e_MawxWRA_7nNHcjSs';

export type CommunityDiscovery = { id: string; mission_title: string; observation: string; location: string | null; author_name: string; created_at: string };
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

export async function publishDiscovery(item: { missionTitle: string; observation: string; location: string }) {
  const response = await fetch(`${URL}/rest/v1/community_discoveries`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ mission_title: item.missionTitle, observation: item.observation, location: item.location || null, author_name: 'Explorer' }) });
  if (!response.ok) throw new Error('Saved on this device, but could not publish to the community yet.');
}
export async function loadCommunityDiscoveries(): Promise<CommunityDiscovery[]> {
  const response = await fetch(`${URL}/rest/v1/community_discoveries?select=id,mission_title,observation,location,author_name,created_at&order=created_at.desc&limit=50`, { headers });
  if (!response.ok) throw new Error('Community discoveries are unavailable.');
  return response.json();
}
