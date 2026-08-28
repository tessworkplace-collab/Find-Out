import React from 'react';
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius } from '../theme';

export type MissionCardState = 'default' | 'active' | 'completed';

type MissionCardProps = {
  state?: MissionCardState;
  category?: string;
  title: string;
  description: string;
  progressLabel: string;
  progress: number;
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
  onPress,
  disabled = false,
}: MissionCardProps) {
  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const progressWidth = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` as DimensionValue;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
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
