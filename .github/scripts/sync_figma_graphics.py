from pathlib import Path
import re

native_path = Path('NativeApp.tsx')
theme_path = Path('src/theme.ts')
s = native_path.read_text()


def replace_once(old: str, new: str, label: str):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, got {count}')
    s = s.replace(old, new, 1)


def regex_once(pattern: str, replacement: str, label: str):
    global s
    s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, got {count}')
    s = s2

# Exact approved brand mark already lives in the repository.
if "import { BRAND_MARK_URI } from './src/brand';" not in s:
    replace_once(
        "import { colors, radius, typography } from './src/theme';",
        "import { BRAND_MARK_URI } from './src/brand';\nimport { colors, radius, typography } from './src/theme';",
        'brand import',
    )

if "const brandMark = { uri: BRAND_MARK_URI };" not in s:
    replace_once(
        "const MISSION_OFFER_COUNT = 6;",
        "const MISSION_OFFER_COUNT = 6;\nconst brandMark = { uri: BRAND_MARK_URI };",
        'brand constant',
    )

# Add optical progress data for the three visible trophy goals.
if 'function trophyProgressFor(' not in s:
    marker = "function AppText({ children, style, ...props }: React.ComponentProps<typeof Text>) {"
    helper = """function trophyProgressFor(id: TrophyId, discoveries: CompletedDiscovery[]) {
  if (id === 'sharp-observer') {
    return { current: Math.min(discoveries.length, 3), target: 3 };
  }
  if (id === 'evidence-keeper') {
    const evidenceTypes = new Set(discoveries.map(item => item.evidenceType));
    return { current: Math.min(evidenceTypes.size, 3), target: 3 };
  }
  if (id === 'pattern-finder') {
    const missionIds = new Set(discoveries.map(item => item.missionId));
    return { current: Math.min(missionIds.size, 4), target: 4 };
  }
  const completedAfterHours = discoveries.some(item => item.missionId === 'after-hours');
  return { current: completedAfterHours ? 1 : 0, target: 1 };
}

"""
    replace_once(marker, helper + marker, 'trophy progress helper')

# Extend TopBar only for the Figma Close variant: close button belongs on the left.
regex_once(
    r"function TopBar\(\{\n  title,\n  onBack,\n  onExit,\n\}: \{\n  title: string;\n  onBack\?: \(\) => void;\n  onExit\?: \(\) => void;\n\}\) \{.*?\n\}\n\nfunction Stepper",
    """function TopBar({
  title,
  onBack,
  onExit,
  closeLeading = false,
}: {
  title: string;
  onBack?: () => void;
  onExit?: () => void;
  closeLeading?: boolean;
}) {
  const leadingAction = onBack ?? (closeLeading ? onExit : undefined);
  const trailingAction = closeLeading ? undefined : onExit;

  return (
    <View style={styles.topBar}>
      <Pressable style={styles.hit} onPress={leadingAction} disabled={!leadingAction}>
        {onBack ? (
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        ) : closeLeading && onExit ? (
          <Ionicons name="close" size={24} color={colors.ink} />
        ) : null}
      </Pressable>
      <AppText style={styles.topTitle}>{title}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Exit mission to Home"
        style={styles.hit}
        onPress={trailingAction}
        disabled={!trailingAction}
      >
        {trailingAction ? <Ionicons name="close" size={24} color={colors.ink} /> : null}
      </Pressable>
    </View>
  );
}

function Stepper""",
    'top bar',
)

# Mission completed: match Figma 09 hierarchy. Keep real trophy state and app actions.
regex_once(
    r"  if \(screen === 'complete'\) \{.*?\n  if \(screen === 'discovery-detail'",
    """  if (screen === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title="Mission complete"
          onExit={() => setScreen('discover')}
          closeLeading
        />
        <ScrollView contentContainerStyle={[styles.content, styles.completeContent]}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size={48} color={colors.ink} />
          </View>
          <View style={styles.completeTitleBlock}>
            <AppText style={[styles.h1, styles.completeCentered]}>Discovery submitted</AppText>
            <AppText style={[styles.body, styles.completeBody]}>
              Your evidence has been saved and sent to the prototype review state.
            </AppText>
          </View>
          <View style={styles.completeReviewCard}>
            <AppText style={styles.label}>PENDING REVIEW</AppText>
            <AppText style={styles.smallMuted}>Approval is simulated in this prototype.</AppText>
          </View>
          {newlyUnlockedTrophyIds.length > 0 ? (
            <View style={styles.trophyUnlockWrap}>
              <AppText style={styles.trophyUnlockEyebrow}>TROPHY UNLOCKED</AppText>
              {newlyUnlockedTrophyIds.map(id => {
                const trophy = trophyById(id);
                return trophy ? (
                  <View key={id} style={[styles.trophyCardNative, styles.trophyCardUnlockedNative]}>
                    <View style={[styles.trophyIconNative, styles.trophyIconUnlockedNative]}>
                      <Ionicons name="trophy-outline" size={32} color={colors.blue} />
                    </View>
                    <View style={styles.trophyCardCopy}>
                      <AppText style={styles.trophyCardTitle}>{trophy.title}</AppText>
                      <AppText style={styles.trophyCardDescription}>{trophy.description}</AppText>
                    </View>
                    <View style={[styles.trophyStatusPill, styles.trophyStatusUnlocked]}>
                      <AppText style={styles.trophyStatusUnlockedText}>Unlocked</AppText>
                    </View>
                  </View>
                ) : null;
              })}
            </View>
          ) : null}
          <PrimaryButton label="See other discoveries" onPress={openMyDiscoveries} />
          <PrimaryButton outline label="Explore another mission" onPress={resetMission} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'discovery-detail'""",
    'complete screen',
)

# Trophies: match Figma 21 while preserving unlock persistence + title equip.
regex_once(
    r"  if \(screen === 'trophies'\) \{.*?\n  if \(screen === 'discoveries'\) \{",
    """  if (screen === 'trophies') {
    const unlockedMap = new Map(progression.unlockedTrophies.map(item => [item.id, item]));
    const inProgressCount = trophyDefinitions.filter(trophy => {
      if (unlockedMap.has(trophy.id) || trophy.hidden) return false;
      return trophyProgressFor(trophy.id, discoveries).current > 0;
    }).length;
    const hiddenCount = trophyDefinitions.filter(
      trophy => trophy.hidden && !unlockedMap.has(trophy.id),
    ).length;

    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Trophies & titles" onBack={() => setScreen('profile')} />
        <ScrollView contentContainerStyle={[styles.content, styles.trophiesContent]}>
          <View style={styles.trophiesIntro}>
            <View style={styles.trophiesIntroCopy}>
              <AppText style={styles.eyebrow}>ACHIEVEMENT FIELD LOG</AppText>
              <AppText style={styles.trophiesSummary}>
                {progression.unlockedTrophies.length} unlocked · {inProgressCount} in progress · {hiddenCount} hidden
              </AppText>
            </View>
            <Image source={brandMark} style={styles.trophiesBrandMark} />
          </View>

          {trophyDefinitions.map(trophy => {
            const unlocked = unlockedMap.get(trophy.id);
            const hiddenLocked = trophy.hidden && !unlocked;
            const equipped = progression.equippedTitleId === trophy.id;
            const progress = trophyProgressFor(trophy.id, discoveries);
            const inProgress = !unlocked && !hiddenLocked && progress.current > 0;
            const statusText = unlocked
              ? equipped
                ? 'Equipped'
                : 'Unlocked'
              : inProgress
                ? `${progress.current} / ${progress.target}`
                : 'Locked';

            return (
              <View
                key={trophy.id}
                style={[
                  styles.trophyCardNative,
                  unlocked && styles.trophyCardUnlockedNative,
                  inProgress && styles.trophyCardProgressNative,
                  hiddenLocked && styles.trophyCardLockedNative,
                ]}
              >
                <View
                  style={[
                    styles.trophyIconNative,
                    unlocked && styles.trophyIconUnlockedNative,
                    inProgress && styles.trophyIconProgressNative,
                    hiddenLocked && styles.trophyIconLockedNative,
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={32}
                    color={unlocked || inProgress ? colors.blue : colors.muted}
                  />
                </View>
                <View style={styles.trophyCardCopy}>
                  <AppText
                    style={[
                      styles.trophyCardTitle,
                      hiddenLocked && styles.trophyCardTitleLocked,
                    ]}
                  >
                    {hiddenLocked ? 'Hidden Trophy' : trophy.title}
                  </AppText>
                  <AppText
                    style={[
                      styles.trophyCardDescription,
                      hiddenLocked && styles.trophyCardDescriptionLocked,
                    ]}
                  >
                    {hiddenLocked ? 'Keep exploring to reveal this trophy.' : trophy.description}
                  </AppText>
                </View>
                {unlocked ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${equipped ? 'Unequip' : 'Equip'} ${trophy.title} title`}
                    style={[styles.trophyStatusPill, styles.trophyStatusUnlocked]}
                    onPress={() => void toggleEquippedTitle(trophy.id)}
                  >
                    <AppText style={styles.trophyStatusUnlockedText}>{statusText}</AppText>
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.trophyStatusPill,
                      inProgress ? styles.trophyStatusProgress : styles.trophyStatusLocked,
                    ]}
                  >
                    <AppText
                      style={inProgress ? styles.trophyStatusProgressText : styles.trophyStatusLockedText}
                    >
                      {statusText}
                    </AppText>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'discoveries') {""",
    'trophies screen',
)

# Visual style reconciliation with the current Figma components.
replace_once(
    "  completeWrap: { alignItems: 'center', gap: 18, paddingTop: 60 },",
    """  completeWrap: { alignItems: 'center', gap: 18, paddingTop: 18 },
  completeContent: { alignItems: 'center', gap: 16, paddingTop: 18, paddingBottom: 24 },
  completeTitleBlock: { width: '100%', alignItems: 'center', gap: 24 },
  completeCentered: { textAlign: 'center' },
  completeBody: { textAlign: 'center', maxWidth: 320 },
  completeReviewCard: {
    width: '100%',
    minHeight: 68,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 3,
  },""",
    'complete styles',
)

regex_once(
    r"  trophyUnlockWrap: \{ width: '100%', gap: 10 \},.*?  nativeNote: \{",
    """  trophyUnlockWrap: { width: '100%', gap: 8 },
  trophyUnlockEyebrow: { ...typography.tiny, color: colors.blue, letterSpacing: 0.88, opacity: 0.55 },
  trophiesContent: { gap: 12, paddingTop: 18, paddingBottom: 24 },
  trophiesIntro: {
    width: '100%',
    height: 88,
    paddingBottom: 10,
    position: 'relative',
  },
  trophiesIntroCopy: { gap: 4, paddingRight: 40 },
  trophiesSummary: { ...typography.body, color: colors.text },
  trophiesBrandMark: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  trophyCardNative: {
    height: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  trophyCardUnlockedNative: { backgroundColor: colors.limeSubtle, borderColor: colors.limeBorder },
  trophyCardProgressNative: { backgroundColor: colors.blueSubtle, borderColor: colors.blueBorder },
  trophyCardLockedNative: { backgroundColor: '#FAFAFA', borderColor: colors.borderStrong },
  trophyIconNative: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.softGrey,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trophyIconUnlockedNative: { backgroundColor: colors.white },
  trophyIconProgressNative: { backgroundColor: colors.white },
  trophyIconLockedNative: { backgroundColor: colors.border },
  trophyCardCopy: { flex: 1, gap: 4, minWidth: 0 },
  trophyCardTitle: { fontFamily: 'Archivo_600SemiBold', fontSize: 16, lineHeight: 22, color: colors.ink },
  trophyCardTitleLocked: { color: colors.text },
  trophyCardDescription: { ...typography.small, color: colors.text },
  trophyCardDescriptionLocked: { color: colors.muted },
  trophyStatusPill: {
    minHeight: 24,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trophyStatusUnlocked: { backgroundColor: colors.limeBorder },
  trophyStatusProgress: { backgroundColor: colors.blueBorder },
  trophyStatusLocked: { backgroundColor: colors.border },
  trophyStatusUnlockedText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, color: colors.ink },
  trophyStatusProgressText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, color: colors.blue },
  trophyStatusLockedText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, color: colors.muted },
  nativeNote: {""",
    'trophy styles',
)

native_path.write_text(s)

# Add the two Figma surface-border tokens without changing the existing palette.
t = theme_path.read_text()
if "limeBorder:" not in t:
    t = t.replace("  limeSubtle: '#F6FCE8',", "  limeSubtle: '#F6FCE8',\n  limeBorder: '#EAF9BF',")
if "blueBorder:" not in t:
    t = t.replace("  blueSubtle: '#F4F7FF',", "  blueSubtle: '#F4F7FF',\n  blueBorder: '#E8EEFF',")
theme_path.write_text(t)
