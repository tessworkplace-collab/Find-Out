import React, { useState } from 'react';
import {
  Image,
  Pressable,
  processColor,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Archivo_700Bold,
  useFonts as useArchivoFonts,
} from '@expo-google-fonts/archivo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { BRAND_MARK_URI } from './src/brand';
import { colors, radius } from './src/theme';

// NativeApp's only ink-coloured border is the photo shutter outer ring.
// Preserve React Native's normal color preprocessing while remapping that ring to Find Out blue.
StyleSheet.setStyleAttributePreprocessor('borderColor', value =>
  processColor(value === colors.ink ? colors.blue : value),
);

const NativeApp = require('./NativeApp').default as React.ComponentType;
const brandMark = { uri: BRAND_MARK_URI };

function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.onboarding}>
        <View style={styles.hero}>
          <View style={styles.logoLockup}>
            <Image source={brandMark} style={styles.logoMark} />
            <View style={styles.logoType}>
              <Text style={styles.logoName}>FIND OUT</Text>
              <Text style={styles.logoTag}>OPEN DISCOVERY</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.display}>Turn curiosity into a mission.</Text>
            <Text style={styles.bodyLarge}>
              Notice what is missing, investigate the real world, and submit your own discovery.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Start exploring</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          >
            <Text style={styles.outlineButtonText}>How it works</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Notice  •  Investigate  •  Submit  •  Reveal</Text>
      </View>
    </SafeAreaView>
  );
}

export default function NativeRoot() {
  const [archivoLoaded] = useArchivoFonts({ Archivo_700Bold });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });
  const [started, setStarted] = useState(false);

  if (!archivoLoaded || !interLoaded) return null;

  if (!started) {
    return <Onboarding onStart={() => setStarted(true)} />;
  }

  return <NativeApp />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  onboarding: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
    backgroundColor: colors.white,
  },
  hero: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
    position: 'relative',
  },
  logoLockup: {
    position: 'absolute',
    top: 28,
    left: 0,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  logoType: {
    justifyContent: 'center',
  },
  logoName: {
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 23,
    lineHeight: 26,
    letterSpacing: 0.7,
  },
  logoTag: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 7,
    lineHeight: 10,
    letterSpacing: 2.1,
  },
  titleBlock: {
    width: '100%',
    gap: 24,
    marginTop: 18,
  },
  display: {
    width: '100%',
    color: colors.ink,
    fontFamily: 'Archivo_700Bold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.88,
  },
  bodyLarge: {
    width: 320,
    maxWidth: '100%',
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 26,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    height: 48,
    width: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outlineButton: {
    height: 48,
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  outlineButtonText: {
    color: colors.blue,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
