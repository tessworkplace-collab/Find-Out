import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Publication, CommunityDiscovery, isPublished, publishDiscovery, loadCommunityDiscoveries } from '../communityDiscoveries';
import { colors, typography } from '../theme';
import { FigmaActionButton, FigmaTopBar } from './FigmaProductScreens';

export function PublicationStatus({ item }: { item: Publication }) {
  const [state, setState] = useState<'loading' | 'synced' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const mounted = useRef(true);
  const send = async () => {
    if (busy.current) return;
    busy.current = true;
    setState('loading');
    try {
      if (!(await isPublished(item.id))) await publishDiscovery(item);
      if (mounted.current) setState('synced');
    } catch (error) {
      if (mounted.current) {
        setState('error');
        setMessage(error instanceof Error && error.name !== 'AbortError' ? error.message : 'Connection timed out. Please retry.');
      }
    } finally { busy.current = false; }
  };
  useEffect(() => {
    mounted.current = true;
    void send();
    return () => { mounted.current = false; };
  }, [item.id]);
  return <View style={{ padding: 16, gap: 8, backgroundColor: colors.blueSubtle }}>
    <Text accessibilityLiveRegion="polite" style={{ ...typography.small, color: colors.text }}>
      {state === 'loading' ? 'Saved on this device · Publishing observation…' :
        state === 'synced' ? 'Observation shared with the community. Evidence stays on this device.' : message}
    </Text>
    {state === 'error' ? <FigmaActionButton label="Retry upload" outline onPress={() => void send()} /> : null}
  </View>;
}

export function CommunityScreen({ item, prompt, onBack, onExplore }: {
  item: Publication; prompt: string; onBack: () => void; onExplore: () => void;
}) {
  const [items, setItems] = useState<CommunityDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setItems([]);
    loadCommunityDiscoveries(item.missionTitle)
      .then(rows => { if (active) setItems(rows); })
      .catch(() => { if (active) setError('Could not load discoveries. Please retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [item.missionTitle, attempt]);
  return <View style={{ flex: 1, backgroundColor: colors.white }}>
    <FigmaTopBar title="Other discoveries" type="back" onLeading={onBack} />
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ ...typography.label, color: colors.blue }}>MISSION · {item.missionTitle}</Text>
      <Text style={typography.body}>{prompt}</Text>
      <View style={{ backgroundColor: colors.limeSubtle, borderRadius: 16, padding: 18, gap: 8 }}>
        <Text style={typography.label}>YOUR DISCOVERY</Text>
        <Text style={typography.body}>{item.observation}</Text>
        {item.location ? <Text style={typography.small}>{item.location}</Text> : null}
      </View>
      <Text style={typography.label}>WHAT OTHERS FOUND</Text>
      {loading ? <Text accessibilityLiveRegion="polite">Loading discoveries…</Text> : null}
      {error ? <><Text accessibilityLiveRegion="polite">{error}</Text><FigmaActionButton label="Retry" outline onPress={() => setAttempt(n => n + 1)} /></> : null}
      {!loading && !error && !items.length ? <Text style={typography.body}>No other discoveries for this mission yet.</Text> : null}
      {items.map(row => <View key={row.id} style={{ padding: 18, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 16 }}>
        <Text style={typography.label}>{row.author_name}</Text>
        <Text style={typography.body}>{row.observation}</Text>
        {row.location ? <Text style={typography.small}>{row.location}</Text> : null}
      </View>)}
      <FigmaActionButton label="Explore another mission" outline onPress={onExplore} />
    </ScrollView>
  </View>;
}
