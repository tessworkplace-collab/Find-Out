import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_MARK_URI } from '../brand';
import { colors, radius } from '../theme';

type TopBarType = 'root' | 'back' | 'close';
type NavDestination = 'discover' | 'mission' | 'profile';
type CaptureMode = 'photo' | 'video' | 'audio';

type TopBarProps = {
  title: string;
  type?: TopBarType;
  onLeading?: () => void;
  onTrailing?: () => void;
};

export function FigmaTopBar({
  title,
  type = 'back',
  onLeading,
  onTrailing,
}: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole={onLeading ? 'button' : undefined}
        disabled={!onLeading && type !== 'root'}
        onPress={onLeading}
        style={styles.topBarAction}
      >
        {type === 'root' ? (
          <Image source={{ uri: BRAND_MARK_URI }} style={styles.brandIcon} />
        ) : (
          <Ionicons
            name={type === 'close' ? 'close' : 'chevron-back'}
            size={24}
            color={colors.ink}
          />
        )}
      </Pressable>

      <Text style={styles.topBarTitle}>{title}</Text>

      <Pressable
        accessibilityRole={onTrailing ? 'button' : undefined}
        disabled={!onTrailing}
        onPress={onTrailing}
        style={styles.topBarAction}
      >
        {type === 'root' ? (
          <Ionicons name="person-outline" size={24} color={colors.ink} />
        ) : type === 'back' ? (
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
        ) : null}
      </Pressable>
    </View>
  );
}

type BottomNavigationProps = {
  active: NavDestination;
  onDiscover: () => void;
  onMission: () => void;
  onProfile?: () => void;
};

export function FigmaBottomNavigation({
  active,
  onDiscover,
  onMission,
  onProfile,
}: BottomNavigationProps) {
  const items: Array<{
    id: NavDestination;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
  }> = [
    { id: 'discover', label: 'Discover', onPress: onDiscover },
    { id: 'mission', label: 'Mission', icon: 'flag-outline', onPress: onMission },
    { id: 'profile', label: 'Profile', icon: 'person-outline', onPress: onProfile },
  ];

  return (
    <View style={styles.bottomNavigation}>
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <Pressable
            key={item.id}
            disabled={!item.onPress}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.navItem,
              selected && styles.navItemActive,
              pressed && styles.pressed,
            ]}
          >
            {item.id === 'discover' ? (
              <Image source={{ uri: BRAND_MARK_URI }} style={styles.navBrandIcon} />
            ) : (
              <Ionicons
                name={item.icon!}
                size={24}
                color={selected ? colors.blue : colors.muted}
              />
            )}
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type StepperProps = {
  active: number;
  onStepPress?: (index: number) => void;
  maxStep?: number;
};

export function FigmaMissionStepper({
  active,
  onStepPress,
  maxStep = active,
}: StepperProps) {
  const labels = ['Notice', 'Investigate', 'Document', 'Submit'];

  return (
    <View style={styles.stepper}>
      {labels.map((label, index) => {
        const completed = index < active;
        const selected = index === active;
        const enabled = Boolean(onStepPress) && index <= maxStep;

        return (
          <Pressable
            key={label}
            disabled={!enabled}
            onPress={() => onStepPress?.(index)}
            style={({ pressed }) => [styles.stepItem, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.stepNumber,
                completed && styles.stepNumberCompleted,
                selected && styles.stepNumberActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumberText,
                  completed && styles.stepTextCompleted,
                  selected && styles.stepTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                completed && styles.stepTextCompleted,
                selected && styles.stepLabelActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  outline?: boolean;
};

export function FigmaActionButton({
  label,
  onPress,
  outline = false,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        outline && styles.actionButtonOutline,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionButtonText, outline && styles.actionButtonTextOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function MissionNumber({ number }: { number: string }) {
  return (
    <View style={styles.missionNumber}>
      <View style={styles.missionRail} />
      <Text style={styles.missionNumberLabel}>MISSION</Text>
      <View style={styles.clueDot} />
      <Text style={styles.missionNumberValue}>{number}</Text>
    </View>
  );
}

type BrowseMissionCardProps = {
  difficulty: string;
  title: string;
  description: string;
  action: string;
  number: string;
  featured?: boolean;
  onPress: () => void;
};

function BrowseMissionCard({
  difficulty,
  title,
  description,
  action,
  number,
  featured = false,
  onPress,
}: BrowseMissionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.browseCard, pressed && styles.pressed]}
    >
      <View style={styles.difficultyBadge}>
        <Text style={styles.difficultyText}>{difficulty}</Text>
      </View>
      <Text style={[styles.browseTitle, featured && styles.browseTitleFeatured]}>
        {title}
      </Text>
      <Text style={styles.browseDescription}>{description}</Text>
      <Text style={styles.browseAction}>{action}</Text>
      <MissionNumber number={number} />
    </Pressable>
  );
}

function FilterChip({
  label,
  selected = false,
  wide = false,
}: {
  label: string;
  selected?: boolean;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.filterChip,
        selected && styles.filterChipSelected,
        wide && styles.filterChipWide,
      ]}
    >
      {selected ? <View style={styles.filterDot} /> : null}
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </View>
  );
}

type ProductDiscoverScreenProps = {
  onOpenFeatured: () => void;
  onOpenMission: () => void;
  onCollection: () => void;
  onProfile?: () => void;
};

export function ProductDiscoverScreen({
  onOpenFeatured,
  onOpenMission,
  onCollection,
  onProfile,
}: ProductDiscoverScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar title="FIND OUT" type="root" onTrailing={onProfile} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.discoverContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.h1}>Something familiar. Something unnoticed.</Text>
          <Text style={styles.body}>Open one mission and investigate it your way.</Text>
        </View>

        <SectionLabel>FEATURED MISSION</SectionLabel>
        <BrowseMissionCard
          difficulty="EASY"
          title="Why Is This Here?"
          description="An ordinary setting contains something that seems out of place."
          action="OPEN FEATURED MISSION →"
          number="03"
          featured
          onPress={onOpenFeatured}
        />

        <SectionLabel>EXPLORE MISSIONS</SectionLabel>
        <View style={styles.filterRow}>
          <FilterChip label="All" selected />
          <FilterChip label="Easy" />
          <FilterChip label="Medium" />
          <FilterChip label="Hard" />
        </View>

        <BrowseMissionCard
          difficulty="MEDIUM"
          title="Dead Link"
          description="A place still exists online, but reality may have moved on."
          action="OPEN MISSION →"
          number="01"
          onPress={onOpenMission}
        />
      </ScrollView>

      <FigmaBottomNavigation
        active="discover"
        onDiscover={() => undefined}
        onMission={onCollection}
        onProfile={onProfile}
      />
    </View>
  );
}

type ProductMissionDetailScreenProps = {
  title: string;
  summary: string;
  question: string;
  guidance: string;
  number?: string;
  difficulty?: string;
  evidence?: string;
  onBack: () => void;
  onOpen: () => void;
};

export function ProductMissionDetailScreen({
  title,
  summary,
  question,
  guidance,
  number = '01',
  difficulty = 'MEDIUM',
  evidence = 'Photo',
  onBack,
  onOpen,
}: ProductMissionDetailScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar title="Mission" type="back" onLeading={onBack} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.missionDetailContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.missionIdentity}>
          <MissionNumber number={number} />
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.h1}>{title}</Text>
          <Text style={styles.body}>{summary}</Text>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementEyebrow}>ACCEPTED EVIDENCE</Text>
          <Text style={styles.requirementValue}>{evidence}</Text>
          <Text style={styles.requirementNote}>Short finding required</Text>
        </View>

        <FigmaMissionStepper active={0} />

        <View style={styles.clueCard}>
          <View style={styles.clueRailTop} />
          <View style={styles.clueRailBottom} />
          <View style={styles.clueCardDot} />
          <Text style={styles.clueEyebrow}>CLUE 01 · OPEN</Text>
          <Text style={styles.clueQuestion}>{question}</Text>
          <Text style={styles.clueGuidance}>{guidance}</Text>
        </View>

        <FigmaActionButton label="Open the mission" onPress={onOpen} />
      </ScrollView>
    </View>
  );
}

type ProductInvestigateScreenProps = {
  question: string;
  onBack: () => void;
  onExit?: () => void;
  onFound: () => void;
  onStepPress?: (index: number) => void;
  maxStep?: number;
};

export function ProductInvestigateScreen({
  question,
  onBack,
  onExit,
  onFound,
  onStepPress,
  maxStep = 1,
}: ProductInvestigateScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar
        title="Investigate"
        type="back"
        onLeading={onBack}
        onTrailing={onExit}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.investigateContent}
        showsVerticalScrollIndicator={false}
      >
        <FigmaMissionStepper active={1} maxStep={maxStep} onStepPress={onStepPress} />

        <View style={styles.investigateTitleRow}>
          <View style={styles.signalRail}>
            <View style={styles.signalDot} />
          </View>
          <View style={styles.investigateCopy}>
            <Text style={styles.h1}>Follow the signal</Text>
            <Text style={styles.body}>Move slowly. Let one detail lead you to the next.</Text>
          </View>
        </View>

        <View style={styles.currentMissionCard}>
          <View style={styles.currentMissionDot} />
          <Text style={styles.currentMissionEyebrow}>YOUR MISSION</Text>
          <Text style={styles.currentMissionQuestion}>{question}</Text>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceTitle}>Pay closer attention</Text>
          <Text style={styles.guidanceText}>
            Notice what stands out, then decide what matters.
          </Text>
        </View>

        <FigmaActionButton label="I found something" onPress={onFound} />
      </ScrollView>
    </View>
  );
}

type ProductEvidencePickerScreenProps = {
  onBack: () => void;
  onExit?: () => void;
  onSelect: (mode: CaptureMode) => void;
  onStepPress?: (index: number) => void;
  maxStep?: number;
};

export function ProductEvidencePickerScreen({
  onBack,
  onExit,
  onSelect,
  onStepPress,
  maxStep = 2,
}: ProductEvidencePickerScreenProps) {
  const modes: Array<{
    id: CaptureMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { id: 'photo', label: 'Photo', icon: 'camera-outline' },
    { id: 'video', label: 'Video', icon: 'videocam-outline' },
    { id: 'audio', label: 'Audio', icon: 'mic-outline' },
  ];

  return (
    <View style={styles.screen}>
      <FigmaTopBar
        title="Capture evidence"
        type="back"
        onLeading={onBack}
        onTrailing={onExit}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.evidenceContent}
        showsVerticalScrollIndicator={false}
      >
        <FigmaMissionStepper active={2} maxStep={maxStep} onStepPress={onStepPress} />

        <View style={styles.titleBlock}>
          <Text style={styles.h1}>Capture what you found</Text>
          <Text style={styles.body}>Choose the format that best shows your discovery.</Text>
        </View>

        <View style={styles.evidencePreview}>
          <Image source={{ uri: BRAND_MARK_URI }} style={styles.evidenceBrandMark} />
        </View>

        <View style={styles.captureRow}>
          {modes.map((mode) => (
            <Pressable
              key={mode.id}
              onPress={() => onSelect(mode.id)}
              style={({ pressed }) => [styles.captureAction, pressed && styles.pressed]}
            >
              <View style={styles.captureIcon}>
                <Ionicons name={mode.icon} size={24} color={colors.blue} />
              </View>
              <Text style={styles.captureLabel}>{mode.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ProductCompleteScreenProps = {
  onClose: () => void;
  onOtherDiscoveries: () => void;
  onExplore: () => void;
};

export function ProductCompleteScreen({
  onClose,
  onOtherDiscoveries,
  onExplore,
}: ProductCompleteScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar title="Mission complete" type="close" onLeading={onClose} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.completeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={44} color={colors.ink} />
        </View>

        <View style={styles.completeTitleBlock}>
          <Text style={[styles.h1, styles.centerText]}>Discovery submitted</Text>
          <Text style={[styles.body, styles.centerText, styles.completeBody]}>
            Your evidence has been saved and sent to the prototype review state.
          </Text>
        </View>

        <View style={styles.reviewBanner}>
          <Text style={styles.reviewTitle}>PENDING REVIEW</Text>
          <Text style={styles.reviewText}>Approval is simulated in this prototype.</Text>
        </View>

        <View style={styles.trophySection}>
          <Text style={styles.trophyEyebrow}>TROPHY UNLOCKED</Text>
          <View style={styles.trophyCard}>
            <View style={styles.trophyIconStage}>
              <Ionicons name="trophy-outline" size={32} color={colors.blue} />
            </View>
            <View style={styles.trophyCopy}>
              <Text style={styles.trophyTitle}>Sharp Observer</Text>
              <Text style={styles.trophyDescription}>
                You documented three field discoveries.
              </Text>
            </View>
            <View style={styles.trophyPill}>
              <Text style={styles.trophyPillText}>Unlocked</Text>
            </View>
          </View>
        </View>

        <FigmaActionButton label="See other discoveries" onPress={onOtherDiscoveries} />
        <FigmaActionButton label="Explore another mission" outline onPress={onExplore} />
      </ScrollView>
    </View>
  );
}

export type CollectionEvidence = {
  id: string;
  day: string;
  title: string;
  note: string;
};

type ProductCollectionScreenProps = {
  activeMissionTitle: string;
  evidence?: CollectionEvidence[];
  onContinue: () => void;
  onEvidence?: (id: string) => void;
  onDiscover: () => void;
  onProfile?: () => void;
};

const defaultCollectionEvidence: CollectionEvidence[] = [
  {
    id: 'dead-link-01',
    day: 'TODAY',
    title: 'The place has changed',
    note: 'A different shop now occupies the address.',
  },
  {
    id: 'dead-link-02',
    day: 'YESTERDAY',
    title: 'The old sign survived',
    note: 'The old sign remains above a new shop.',
  },
];

export function ProductCollectionScreen({
  activeMissionTitle,
  evidence = defaultCollectionEvidence,
  onContinue,
  onEvidence,
  onDiscover,
  onProfile,
}: ProductCollectionScreenProps) {
  const visibleEvidence = evidence.length > 0 ? evidence.slice(0, 2) : defaultCollectionEvidence;

  return (
    <View style={styles.screen}>
      <FigmaTopBar title="My Discoveries" type="root" onTrailing={onProfile} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.collectionContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionIndex}>
          <Text style={styles.collectionHeading}>Your missions and discoveries</Text>
          <View style={styles.discoveryCount}>
            <View style={styles.discoveryCountRow}>
              <Text style={styles.discoveryCountValue}>
                {String(visibleEvidence.length).padStart(2, '0')}
              </Text>
              <View style={styles.discoveryCountDot} />
            </View>
            <Text style={styles.discoveryCountLabel}>FOUND</Text>
          </View>
        </View>

        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={20} color={colors.ink} />
          <Text style={styles.searchPlaceholder}>Search discoveries</Text>
        </View>

        <View style={styles.collectionFilters}>
          <FilterChip label="All" selected wide />
          <FilterChip label="City nature" wide />
        </View>

        <View style={styles.activeMissionHub}>
          <Text style={styles.activeMissionEyebrow}>ACTIVE MISSION</Text>
          <Text style={styles.activeMissionTitle}>{activeMissionTitle}</Text>
          <Text style={styles.activeMissionMeta}>Investigate · In progress</Text>
          <Pressable
            onPress={onContinue}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueButtonText}>Continue mission</Text>
          </Pressable>
        </View>

        <Text style={styles.completedLabel}>COMPLETED</Text>

        {visibleEvidence.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onEvidence?.(item.id)}
            style={({ pressed }) => [styles.evidenceListCard, pressed && styles.pressed]}
          >
            <View style={styles.evidenceListCopy}>
              <Text style={styles.evidenceDay}>{item.day}</Text>
              <Text style={styles.evidenceTitle}>{item.title}</Text>
              <Text style={styles.evidenceNote}>{item.note}</Text>
            </View>
            <View style={styles.evidenceThumbnail}>
              <Image source={{ uri: BRAND_MARK_URI }} style={styles.evidenceThumbnailMark} />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <FigmaBottomNavigation
        active="mission"
        onDiscover={onDiscover}
        onMission={() => undefined}
        onProfile={onProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.white },
  pressed: { opacity: 0.78 },

  topBar: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  topBarAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  brandIcon: { width: 24, height: 24, resizeMode: 'contain' },

  bottomNavigation: {
    width: '100%',
    height: 88,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  navItem: {
    width: 104,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  navItemActive: { backgroundColor: colors.blueSubtle },
  navBrandIcon: { width: 24, height: 24, resizeMode: 'contain' },
  navLabel: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  navLabelActive: { color: colors.blue },

  stepper: {
    width: '100%',
    height: 56,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepItem: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCompleted: { backgroundColor: colors.limeSubtle },
  stepNumberActive: { backgroundColor: colors.blue },
  stepNumberText: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  stepLabel: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  stepTextCompleted: { color: colors.ink },
  stepTextActive: { color: colors.white },
  stepLabelActive: { color: colors.blue },

  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  actionButtonOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  actionButtonText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  actionButtonTextOutline: { color: colors.blue },

  titleBlock: { width: '100%', gap: 24 },
  h1: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.24,
  },
  body: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionLabel: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },

  discoverContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  browseCard: {
    width: '100%',
    height: 176,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.white,
    position: 'relative',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  difficultyText: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.55,
  },
  browseTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  browseTitleFeatured: { fontSize: 22, lineHeight: 28 },
  browseDescription: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  browseAction: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  missionNumber: {
    width: 68,
    height: 48,
    position: 'relative',
  },
  missionRail: {
    position: 'absolute',
    left: 0,
    top: 7,
    width: 3,
    height: 34,
    backgroundColor: colors.lime,
  },
  missionNumberLabel: {
    position: 'absolute',
    left: 12,
    top: 4,
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  clueDot: {
    position: 'absolute',
    left: 52,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  missionNumberValue: {
    position: 'absolute',
    left: 12,
    top: 20,
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  filterRow: { flexDirection: 'row', gap: 8, width: '100%' },
  filterChip: {
    minWidth: 64,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
  },
  filterChipSelected: {
    minWidth: 56,
    borderColor: colors.blue,
    backgroundColor: colors.blueSubtle,
  },
  filterChipWide: {
    width: 140,
    height: 44,
    justifyContent: 'flex-start',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  filterText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  filterTextSelected: { color: colors.blue },

  missionDetailContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  missionIdentity: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requirementsCard: {
    width: '100%',
    height: 92,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 17,
    paddingVertical: 15,
    gap: 4,
    backgroundColor: colors.white,
  },
  requirementEyebrow: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  requirementValue: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  requirementNote: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  clueCard: {
    width: '100%',
    minHeight: 164,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
    overflow: 'hidden',
  },
  clueRailTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 4,
    height: 64,
    backgroundColor: colors.blue,
  },
  clueRailBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 4,
    height: 52,
    backgroundColor: colors.blue,
  },
  clueCardDot: {
    position: 'absolute',
    right: 20,
    top: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
  clueEyebrow: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
  },
  clueQuestion: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    paddingRight: 12,
  },
  clueGuidance: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },

  investigateContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  investigateTitleRow: {
    width: '100%',
    minHeight: 104,
    flexDirection: 'row',
    gap: 14,
  },
  signalRail: {
    width: 10,
    height: 76,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
    justifyContent: 'center',
  },
  signalDot: {
    width: 8,
    height: 8,
    marginLeft: -5,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  investigateCopy: { flex: 1, gap: 24 },
  currentMissionCard: {
    width: '100%',
    height: 92,
    borderWidth: 1,
    borderColor: '#CCD9F0',
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  currentMissionDot: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  currentMissionEyebrow: {
    color: '#4D576E',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  currentMissionQuestion: {
    color: '#12141C',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
  },
  guidanceCard: {
    width: '100%',
    height: 76,
    borderRadius: 14,
    backgroundColor: colors.soft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  guidanceTitle: {
    color: '#1F2129',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  guidanceText: {
    color: '#666E82',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },

  evidenceContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 14,
  },
  evidencePreview: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceBrandMark: {
    width: 132,
    height: 132,
    resizeMode: 'contain',
    opacity: 0.22,
  },
  captureRow: { width: '100%', flexDirection: 'row', gap: 8 },
  captureAction: {
    flex: 1,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  captureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureLabel: {
    color: '#12141A',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },

  completeContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
    alignItems: 'center',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitleBlock: { width: '100%', height: 106, gap: 24, alignItems: 'center' },
  centerText: { textAlign: 'center' },
  completeBody: { width: 320 },
  reviewBanner: {
    width: '100%',
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 3,
  },
  reviewTitle: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  reviewText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  trophySection: { width: '100%', height: 146, gap: 8 },
  trophyEyebrow: {
    color: colors.blue,
    opacity: 0.55,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.88,
  },
  trophyCard: {
    width: '100%',
    height: 112,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EAF9BF',
    backgroundColor: colors.limeSubtle,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyIconStage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyCopy: { flex: 1, gap: 4 },
  trophyTitle: {
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
  },
  trophyDescription: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  trophyPill: {
    borderRadius: radius.full,
    backgroundColor: '#EAF9BF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trophyPillText: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },

  collectionContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
  },
  collectionIndex: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionHeading: {
    width: 277,
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.24,
  },
  discoveryCount: { alignItems: 'flex-end' },
  discoveryCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discoveryCountValue: {
    color: colors.blue,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.7,
  },
  discoveryCountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  discoveryCountLabel: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
  },
  searchField: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  collectionFilters: { width: '100%', flexDirection: 'row', gap: 8 },
  activeMissionHub: {
    width: '100%',
    height: 154,
    borderWidth: 1,
    borderColor: '#D6DBCC',
    borderRadius: radius.lg,
    backgroundColor: '#F6F7F4',
    padding: 15,
  },
  activeMissionEyebrow: {
    color: '#121412',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
  },
  activeMissionTitle: {
    color: '#121412',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
    marginTop: 8,
  },
  activeMissionMeta: {
    color: '#121412',
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  continueButton: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 13,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  completedLabel: {
    color: '#595E54',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 17,
  },
  evidenceListCard: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  evidenceListCopy: { flex: 1, height: 88, gap: 4 },
  evidenceDay: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  evidenceTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 17,
    lineHeight: 22,
  },
  evidenceNote: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  evidenceThumbnail: {
    width: 104,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceThumbnailMark: { width: 52, height: 52, resizeMode: 'contain' },
});
