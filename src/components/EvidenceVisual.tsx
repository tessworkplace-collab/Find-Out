import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BRAND_MARK_URI } from '../brand';
import { colors, radius } from '../theme';

export type EvidenceVisualSize = 'detail' | 'share' | 'thumbnail';

type EvidenceVisualProps = {
  size?: EvidenceVisualSize;
  style?: StyleProp<ViewStyle>;
};

export default function EvidenceVisual({
  size = 'detail',
  style,
}: EvidenceVisualProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.visual, styles[size], style]}
    >
      <Image
        source={{ uri: BRAND_MARK_URI }}
        resizeMode="contain"
        style={[styles.mark, styles[`${size}Mark`]]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  visual: {
    backgroundColor: colors.blueSubtle,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detail: {
    width: '100%',
    height: 300,
  },
  share: {
    width: '100%',
    height: 260,
  },
  thumbnail: {
    width: 104,
    height: 88,
  },
  mark: {
    resizeMode: 'contain',
  },
  detailMark: {
    width: 112,
    height: 113,
  },
  shareMark: {
    width: 96,
    height: 97,
  },
  thumbnailMark: {
    width: 52,
    height: 53,
  },
});
