import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { FigmaActionButton, FigmaTopBar } from './FigmaProductScreens';
import { WebEvidence } from '../webDiscoveryStorage';

export function WebEvidencePreview({ evidence }: { evidence: WebEvidence }) {
  if (evidence.type === 'photo') return <Image source={{ uri: evidence.uri }} resizeMode="contain" style={{ width: '100%', height: 260 }} />;
  return React.createElement(evidence.type === 'video' ? 'video' : 'audio', {
    src: evidence.uri, controls: true, preload: 'metadata',
    style: { width: '100%', maxHeight: 280 },
  });
}
export function WebEvidenceInput({ mode, onBack, onSelect }: {
  mode: WebEvidence['type']; onBack: () => void; onSelect: (evidence: WebEvidence) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const choose = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mode === 'photo' ? 'image/*' : mode + '/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith(mode === 'photo' ? 'image/' : mode + '/')) {
        setError('Choose a compatible ' + mode + ' file.'); return;
      }
      if (file.size === 0 || file.size > 25 * 1024 * 1024) {
        setError('Choose a file smaller than 25 MB that is not empty.'); return;
      }
      setBusy(true); setError('');
      const reader = new FileReader();
      reader.onerror = () => { setBusy(false); setError('Could not read this file. Try another.'); };
      reader.onload = () => {
        setBusy(false);
        if (typeof reader.result === 'string') onSelect({ uri: reader.result, name: file.name, type: mode });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  return <View style={{ flex: 1 }}>
    <FigmaTopBar title={'Add ' + mode} type="back" onLeading={onBack} />
    <View style={{ padding: 24, gap: 20 }}>
      <Text>Choose your own {mode} evidence. Maximum file size: 25 MB.</Text>
      {error ? <Text accessibilityLiveRegion="polite">{error}</Text> : null}
      <FigmaActionButton label={busy ? 'Reading file…' : 'Choose ' + mode} disabled={busy} onPress={choose} />
    </View>
  </View>;
}
