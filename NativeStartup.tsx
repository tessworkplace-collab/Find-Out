import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Archivo_600SemiBold,
  useFonts as useArchivoFonts,
} from '@expo-google-fonts/archivo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import NativeApp from './NativeApp';
import NativeRoot from './NativeRoot';
import { BRAND_MARK_URI } from './src/brand';
import { clearDraft, DraftSnapshot, loadDraft } from './src/draftStorage';
import { colors, radius } from './src/theme';

type StartupState = 'loading' | 'choice' | 'root' | 'app';

function isRestorableDraft(draft: DraftSnapshot | null) {
  if (!draft) return false;
  // A user can go back to Document after a submission. In that case submitted may
  // still be true, but the current screen is editable and must still be offered as a draft.
  return !(draft.submitted && draft.screen === 'complete');
}

export default function NativeStartup() {
  const [archivoLoaded] = useArchivoFonts({ Archivo_600SemiBold });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });
  const [startupState, setStartupState] = useState<StartupState>('loading');
  const [draft, setDraft] = useState<DraftSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkDraft = async () => {
      try {
        const restored = await loadDraft();
        if (!mounted) return;

        if (isRestorableDraft(restored)) {
          setDraft(restored);
          setStartupState('choice');
        } else {
          setStartupState('root');
        }
      } catch {
        if (mounted) setStartupState('root');
      }
    };

    checkDraft();
    return () => {
      mounted = false;
    };
  }, []);

  if (!archivoLoaded || !interLoaded || startupState === 'loading') return null;
  if (startupState === 'root') return <NativeRoot />;
  if (startupState === 'app') return <NativeApp />;

  const continueDraft = () => setStartupState('app');

  const startNewMission = () => {
    Alert.alert(
      'Start a new mission?',
      'This will remove your unfinished draft and its saved evidence from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start new',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await clearDraft(draft?.evidence ?? null);
              setDraft(null);
              setStartupState('root');
            } catch {
              Alert.alert('Could not clear draft', 'Please try again.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.brandRow}>
        <Image source={{ uri: BRAND_MARK_URI }} style={styles.brandMark} />
        <View>
          <Text style={styles.brandName}>FIND OUT</Text>
          <Text style={styles.brandTag}>OPEN DISCOVERY</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>↻</Text>
        </View>
        <Text style={styles.title}>Continue your draft?</Text>
        <Text style={styles.body}>
          You have an unfinished mission saved on this device. Continue where you left off or start again.
        </Text>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>SAVED MISSION</Text>
          <Text style={styles.metaTitle}>A sound you know</Text>
          <Text style={styles.metaBody}>
            {draft?.evidence ? `${draft.evidence.type.toUpperCase()} evidence saved` : 'Mission progress saved'}
            {draft?.location ? ` · ${draft.location}` : ''}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={continueDraft}
          disabled={busy}
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.82 }]}
        >
          <Text style={styles.primaryButtonText}>Continue draft</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={startNewMission}
          disabled={busy}
          style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.72 }]}
        >
          <Text style={styles.secondaryButtonText}>{busy ? 'Clearing…' : 'Start new mission'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  brandName: {
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  brandTag: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 2,
  },
  card: {
    marginTop: 'auto',
    marginBottom: 'auto',
    gap: 18,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.blue,
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 34,
  },
  title: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.32,
  },
  body: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  metaCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.blueSubtle,
    padding: 18,
    gap: 6,
  },
  metaLabel: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  metaTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  metaBody: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
});
