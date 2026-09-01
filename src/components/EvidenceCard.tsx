import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRAND_MARK_URI } from '../brand';
import { colors, radius } from '../theme';
import EvidenceVisual from './EvidenceVisual';

export type EvidenceCardLayout = 'grid' | 'list';

type EvidenceCardProps = {
  layout?: EvidenceCardLayout;
  title: string;
  day: string;
  note: string;
  mediaUri?: string;
  onPress?: () => void;
};

export default function EvidenceCard({
  layout = 'list',
  title,
  day,
  note,
  mediaUri,
  onPress,
}: EvidenceCardProps) {
  const isList = layout === 'list';

  const media = mediaUri ? (
    <View style={[styles.media, isList ? styles.mediaList : styles.mediaGrid]}>
      <Image source={{ uri: mediaUri }} resizeMode="cover" style={styles.capturedMedia} />
    </View>
  ) : isList ? (
    <EvidenceVisual size="thumbnail" />
  ) : (
    <View style={[styles.media, styles.mediaGrid]}>
      <Image
        source={{ uri: BRAND_MARK_URI }}
        resizeMode="contain"
        style={styles.placeholderMarkGrid}
      />
    </View>
  );

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, ${day}. ${note}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isList ? styles.cardList : styles.cardGrid,
        pressed && onPress && styles.cardPressed,
      ]}
    >
      {!isList ? media : null}

      <View style={isList ? styles.contentList : styles.contentGrid}>
        <Text style={styles.meta} numberOfLines={1}>
          {day}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.note} numberOfLines={isList ? 2 : 1}>
          {note}
        </Text>
      </View>

      {isList ? media : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  cardList: {
    width: '100%',
    height: 120,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  cardGrid: {
    width: 260,
    height: 238,
    padding: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  cardPressed: {
    opacity: 0.82,
  },
  contentList: {
    flex: 1,
    height: 88,
    gap: 4,
    overflow: 'hidden',
  },
  contentGrid: {
    width: '100%',
    gap: 4,
  },
  meta: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  title: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 17,
    lineHeight: 22,
  },
  note: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  media: {
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaList: {
    width: 104,
    height: 88,
    borderRadius: radius.lg,
  },
  mediaGrid: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
  },
  capturedMedia: {
    width: '100%',
    height: '100%',
  },
  placeholderMarkGrid: {
    width: 40,
    height: 40,
  },
});
