import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius } from '../theme';
import type { MissionIcon } from '../missions';

export type MissionCardState = 'default' | 'active' | 'completed';

type MissionCardProps = {
  state?: MissionCardState;
  category?: string;
  title: string;
  description: string;
  progressLabel: string;
  progress: number;
  icon?: MissionIcon;
  onPress?: () => void;
  disabled?: boolean;
};

export default function MissionCard({
  state = 'default',
  category = 'MISSION',
  title,
  description,
  progressLabel,
  progress,
  icon,
  onPress,
  disabled = false,
}: MissionCardProps) {
  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const progressWidth = (
    isCompleted
      ? '100%'
      : state === 'default' && normalizedProgress === 0
        ? 24
        : `${Math.round(normalizedProgress * 100)}%`
  ) as DimensionValue;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, ${state}, ${progressLabel}`}
      disabled={!onPress || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.cardActive,
        isCompleted && styles.cardCompleted,
        disabled && styles.cardDisabled,
        pressed && onPress && !disabled && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        {state === 'default' ? (
          <View style={[styles.badge, styles.categoryBadge]}>
            <Text style={[styles.badgeText, styles.categoryBadgeText]}>{category}</Text>
          </View>
        ) : (
          <View
            style={[
              styles.badge,
              isCompleted ? styles.completedBadge : styles.activeBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isCompleted ? styles.completedBadgeText : styles.activeBadgeText,
              ]}
            >
              {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
            </Text>
          </View>
        )}

        {icon ? (
          <View style={styles.iconTile}>
            <Ionicons name={icon} size={21} color={colors.blue} />
            <View style={styles.iconAccent} />
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text
        style={[
          styles.progressLabel,
          isActive && styles.progressLabelActive,
          isCompleted && styles.progressLabelCompleted,
        ]}
      >
        {progressLabel}
      </Text>

      <View style={[styles.progressTrack, isCompleted && styles.progressTrackCompleted]}>
        <View
          style={[
            styles.progressFill,
            isCompleted && styles.progressFillCompleted,
            { width: progressWidth },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 176,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  cardActive: {
    minHeight: 200,
    borderWidth: 2,
    borderColor: colors.blue,
    backgroundColor: colors.blueSubtle,
    padding: 24,
    gap: 12,
  },
  cardCompleted: {
    minHeight: 200,
    borderWidth: 2,
    borderColor: colors.lime,
    backgroundColor: colors.limeSubtle,
    padding: 24,
    gap: 12,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryBadge: {
    backgroundColor: colors.blueSubtle,
  },
  activeBadge: {
    backgroundColor: colors.blue,
  },
  completedBadge: {
    backgroundColor: colors.lime,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  categoryBadgeText: {
    color: colors.blue,
    letterSpacing: 0.55,
  },
  activeBadgeText: {
    color: colors.white,
  },
  completedBadgeText: {
    color: colors.ink,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -2,
  },
  iconAccent: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.lime,
    borderWidth: 1,
    borderColor: colors.white,
    position: 'absolute',
    right: 5,
    bottom: 5,
  },
  title: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  progressLabel: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  progressLabelActive: {
    color: colors.blue,
  },
  progressLabelCompleted: {
    color: colors.ink,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressTrackCompleted: {
    backgroundColor: colors.lime,
  },
  progressFill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.blue,
  },
  progressFillCompleted: {
    backgroundColor: colors.lime,
  },
});
