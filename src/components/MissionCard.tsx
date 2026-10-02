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

      </View>

      <View style={styles.titleRow}>
        {icon ? (
          <View accessible={false} style={[styles.missionSymbol, isCompleted && styles.missionSymbolCompleted]}>
            <Ionicons name={icon} size={28} color={colors.blue} />
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.cardFooter}>
      <Text
        style={[
          styles.progressLabel,
          isActive && styles.progressLabelActive,
          isCompleted && styles.progressLabelCompleted,
        ]}
      >
        {progressLabel.replace(/\s*→\s*$/, '')}
      </Text>
      {onPress ? <Ionicons name="arrow-forward" size={18} color={isCompleted ? colors.ink : colors.blue} /> : null}
      </View>

      {state !== 'default' ? <View style={[styles.progressTrack, isCompleted && styles.progressTrackCompleted]}>
        <View
          style={[
            styles.progressFill,
            isCompleted && styles.progressFillCompleted,
            { width: progressWidth },
          ]}
        />
      </View> : null}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  missionSymbol: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  missionSymbolCompleted: {
    backgroundColor: colors.white,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  title: {
    flex: 1,
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  description: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  progressLabel: {
    flexShrink: 1,
    color: colors.blue,
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
