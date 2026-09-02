import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_MARK_URI } from '../brand';
import { ONBOARDING_ILLUSTRATION_URI, ONBOARDING_LOGO_URI } from '../onboardingAssets';
import { colors, radius } from '../theme';
import {
  FEATURED_MISSION_ID,
  MissionDefinition,
  MissionEvidenceMode,
} from '../missions';
import {
  DEFAULT_USER_PREFERENCES,
  loadUserPreferences,
  saveUserPreferences,
  UserPreferences,
} from '../preferencesStorage';
import { TrophyEvaluation } from '../trophySystem';
import EvidenceCard from './EvidenceCard';
import EvidenceVisual from './EvidenceVisual';
import MissionCard from './MissionCard';

type TopBarType = 'root' | 'back' | 'close';
type NavDestination = 'discover' | 'collection' | 'profile';
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
  onCollection: () => void;
  onProfile?: () => void;
};

export function FigmaBottomNavigation({
  active,
  onDiscover,
  onCollection,
  onProfile,
}: BottomNavigationProps) {
  const items: Array<{
    id: NavDestination;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
  }> = [
    { id: 'discover', label: 'Discover', onPress: onDiscover },
    { id: 'collection', label: 'Collection', icon: 'albums-outline', onPress: onCollection },
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
                size={22}
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
      <View style={styles.browseMissionNumber}>
        <MissionNumber number={number} />
      </View>
    </Pressable>
  );
}

function FilterChip({
  label,
  selected = false,
  onPress,
}: {
  label: MissionFilter;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Show ${label.toLowerCase()} difficulty missions`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.pressed,
      ]}
    >
      {selected ? <View style={styles.filterDot} /> : null}
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';
type MissionFilter = 'All' | MissionDifficulty;

const missionFilters: MissionFilter[] = ['All', 'Easy', 'Medium', 'Hard'];

type ProductOnboardingScreenProps = {
  onStart: () => void;
  onHowItWorks: () => void;
};

export function ProductOnboardingScreen({
  onStart,
  onHowItWorks,
}: ProductOnboardingScreenProps) {
  return (
    <View style={styles.onboardingScreen}>
      <ScrollView
        style={styles.onboardingScroll}
        contentContainerStyle={styles.onboardingContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: ONBOARDING_LOGO_URI }} style={styles.onboardingLogo} />

        <Image
          source={{ uri: ONBOARDING_ILLUSTRATION_URI }}
          style={styles.onboardingIllustration}
        />

        <View style={styles.onboardingTitleBlock}>
          <Text style={styles.onboardingTitle}>Turn curiosity into a mission.</Text>
          <Text style={styles.onboardingBody}>
            Notice what is missing, investigate the real world, and submit your own discovery.
          </Text>
        </View>

        <View style={styles.onboardingActions}>
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [styles.onboardingPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.actionButtonText}>Start exploring</Text>
          </Pressable>

          <Pressable
            onPress={onHowItWorks}
            style={({ pressed }) => [styles.onboardingSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.actionButtonTextOutline}>How it works</Text>
          </Pressable>
        </View>

        <Text style={styles.onboardingFooter}>
          Notice  •  Investigate  •  Submit  •  Reveal
        </Text>
      </ScrollView>
    </View>
  );
}

type ProductDiscoverScreenProps = {
  missions: MissionDefinition[];
  activeMissionId?: string | null;
  completedMissionIds?: string[];
  onOpenMission: (missionId: string) => void;
  onCollection: () => void;
  onProfile?: () => void;
};

export function ProductDiscoverScreen({
  missions,
  activeMissionId,
  completedMissionIds = [],
  onOpenMission,
  onCollection,
  onProfile,
}: ProductDiscoverScreenProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<MissionFilter>('All');
  const completedSet = new Set(completedMissionIds);
  const featuredMission =
    missions.find((mission) => mission.id === FEATURED_MISSION_ID) ?? missions[0];
  const visibleMissions = missions.filter(
    (mission) =>
      mission.id !== featuredMission?.id &&
      (selectedFilter === 'All' || mission.difficulty === selectedFilter),
  );

  const renderMission = (mission: MissionDefinition) => {
    const completed = completedSet.has(mission.id);
    const active = activeMissionId === mission.id && !completed;
    const state = completed ? 'completed' : active ? 'active' : 'default';
    const progress = completed ? 1 : active ? 0.5 : 0;
    const progressLabel = completed
      ? 'Mission complete · discovery saved'
      : active
        ? 'In progress · continue mission'
        : `${mission.number} · ${mission.pool} mission`;

    return (
      <MissionCard
        key={mission.id}
        state={state}
        category={`${mission.difficulty.toUpperCase()} · ${mission.pool.toUpperCase()}`}
        title={mission.title}
        description={mission.prompt}
        progressLabel={progressLabel}
        progress={progress}
        onPress={() => onOpenMission(mission.id)}
      />
    );
  };

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
        {featuredMission ? renderMission(featuredMission) : null}

        <SectionLabel>EXPLORE ALL {missions.length} MISSIONS</SectionLabel>
        <View style={styles.filterRow}>
          {missionFilters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </View>

        {visibleMissions.length > 0 ? (
          visibleMissions.map(renderMission)
        ) : (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterTitle}>No {selectedFilter.toLowerCase()} missions yet</Text>
            <Text style={styles.emptyFilterBody}>
              Try another difficulty or choose All to see every available mission.
            </Text>
          </View>
        )}
      </ScrollView>

      <FigmaBottomNavigation
        active="discover"
        onDiscover={() => undefined}
        onCollection={onCollection}
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
  allowedModes?: MissionEvidenceMode[];
  onStepPress?: (index: number) => void;
  maxStep?: number;
};

export function ProductEvidencePickerScreen({
  onBack,
  onExit,
  onSelect,
  allowedModes = ['photo', 'video', 'audio'],
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
          {modes
            .filter((mode) => allowedModes.includes(mode.id))
            .map((mode) => (
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

type ProductEvidencePreviewScreenProps = {
  media: React.ReactNode;
  mediaLabel: string;
  onBack: () => void;
  onExit?: () => void;
  onUse: () => void;
  onRetake: () => void;
  statusLabel?: string;
};

export function ProductEvidencePreviewScreen({
  media,
  mediaLabel,
  onBack,
  onExit,
  onUse,
  onRetake,
  statusLabel = 'Ready to use',
}: ProductEvidencePreviewScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar
        title="Review evidence"
        type="back"
        onLeading={onBack}
        onTrailing={onExit}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.evidenceReviewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.evidenceReviewTitleBlock}>
          <Text style={styles.evidenceReviewTitle}>Check your evidence</Text>
          <Text style={styles.body}>
            Make sure it clearly shows what you discovered.
          </Text>
        </View>

        <View style={styles.evidenceReviewMedia}>
          <View style={styles.evidenceReviewMediaSlot}>{media}</View>
          <View style={styles.evidenceReviewBadge}>
            <Text style={styles.evidenceReviewBadgeText}>{mediaLabel}</Text>
          </View>
        </View>

        <Text style={styles.evidenceReviewStatus}>{statusLabel}</Text>
        <FigmaActionButton label="Use this evidence" onPress={onUse} />
        <FigmaActionButton label="Retake" onPress={onRetake} outline />
      </ScrollView>
    </View>
  );
}

type ProductDocumentScreenProps = {
  observation: string;
  location: string;
  onChangeObservation: (value: string) => void;
  onChangeLocation: (value: string) => void;
  onBack: () => void;
  onExit?: () => void;
  onDiscard?: () => void;
  onSubmit: () => void;
  onStepPress?: (index: number) => void;
  maxStep?: number;
  submitLabel?: string;
  submitDisabled?: boolean;
};

export function ProductDocumentScreen({
  observation,
  location,
  onChangeObservation,
  onChangeLocation,
  onBack,
  onExit,
  onDiscard,
  onSubmit,
  onStepPress,
  maxStep = 2,
  submitLabel = 'Submit discovery',
  submitDisabled = false,
}: ProductDocumentScreenProps) {
  const [showExitConfirmation, setShowExitConfirmation] = React.useState(false);
  const observationMissing = observation.trim().length === 0;
  const isSubmitDisabled = submitDisabled || observationMissing;

  const requestExit = onExit ? () => setShowExitConfirmation(true) : undefined;
  const leaveDraft = () => {
    setShowExitConfirmation(false);
    onExit?.();
  };
  const discardDraft = () => {
    setShowExitConfirmation(false);
    (onDiscard || onExit)?.();
  };

  return (
    <View style={styles.screen}>
      <FigmaTopBar
        title="Document"
        type="back"
        onLeading={onBack}
        onTrailing={requestExit}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.documentContent}
        showsVerticalScrollIndicator={false}
      >
        <FigmaMissionStepper active={2} maxStep={maxStep} onStepPress={onStepPress} />

        <View style={styles.documentTitleBlock}>
          <Text style={styles.fieldNoteIndex}>FIELD NOTE · 03</Text>
          <View style={styles.titleBlock}>
            <Text style={styles.h1}>Describe what you found</Text>
            <Text style={styles.body}>
              Add just enough context for someone else to understand what you found.
            </Text>
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Observation</Text>
          <TextInput
            accessibilityLabel="Observation"
            value={observation}
            onChangeText={onChangeObservation}
            style={[styles.formInput, observationMissing && styles.formInputError]}
          />
          <Text style={[styles.formHelper, observationMissing && styles.formHelperError]}>
            {observationMissing ? 'Add a short observation' : 'Saved as draft'}
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Location</Text>
          <TextInput
            accessibilityLabel="Location"
            value={location}
            onChangeText={onChangeLocation}
            placeholder="Where did you find it?"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
          />
          <Text style={styles.formHelper}>Optional place name</Text>
        </View>

        <View style={styles.evidenceBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.blue} />
          <View style={styles.evidenceBannerCopy}>
            <Text style={styles.evidenceBannerTitle}>Evidence linked</Text>
            <Text style={styles.evidenceBannerText}>
              This entry stays connected to your mission.
            </Text>
          </View>
        </View>

        <Pressable
          disabled={isSubmitDisabled}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.actionButton,
            isSubmitDisabled && styles.disabled,
            pressed && !isSubmitDisabled && styles.pressed,
          ]}
        >
          <Text style={styles.actionButtonText}>{submitLabel}</Text>
        </Pressable>
      </ScrollView>

      {showExitConfirmation ? (
        <View style={styles.confirmationOverlay}>
          <Pressable
            accessibilityLabel="Keep editing"
            onPress={() => setShowExitConfirmation(false)}
            style={styles.confirmationScrim}
          />
          <View style={styles.confirmationSheet}>
            <View style={styles.confirmationHandle} />
            <Text style={styles.confirmationTitle}>Leave this draft?</Text>
            <Text style={styles.confirmationMessage}>
              Your observation has been saved locally. Choose what should happen before you leave.
            </Text>
            <View style={styles.confirmationStatus}>
              <Text style={styles.confirmationStatusText}>Draft saved on this device</Text>
            </View>
            <View style={styles.confirmationActions}>
              <FigmaActionButton
                label="Keep editing"
                onPress={() => setShowExitConfirmation(false)}
              />
              <FigmaActionButton
                label="Save draft & leave"
                onPress={leaveDraft}
                outline
              />
            </View>
            <Pressable onPress={discardDraft} style={styles.confirmationDiscard}>
              <Text style={styles.confirmationDiscardText}>Discard draft</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

type ProductCompleteScreenProps = {
  onClose: () => void;
  onOtherDiscoveries: () => void;
  onExplore: () => void;
  unlockedTrophy?: {
    name: string;
    description: string;
  } | null;
};

export function ProductCompleteScreen({
  onClose,
  onOtherDiscoveries,
  onExplore,
  unlockedTrophy,
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
          <Text style={styles.reviewTitle}>DISCOVERY SAVED</Text>
          <Text style={styles.reviewText}>Only submitted missions count toward Trophy progress.</Text>
        </View>

        {unlockedTrophy ? (
          <View style={styles.trophySection}>
            <Text style={styles.trophyEyebrow}>TROPHY UNLOCKED</Text>
            <View style={styles.trophyCard}>
              <View style={styles.trophyIconStage}>
                <Ionicons name="trophy-outline" size={32} color={colors.blue} />
              </View>
              <View style={styles.trophyCopy}>
                <Text style={styles.trophyTitle}>{unlockedTrophy.name}</Text>
                <Text style={styles.trophyDescription}>{unlockedTrophy.description}</Text>
              </View>
              <View style={styles.trophyPill}>
                <Text style={styles.trophyPillText}>Unlocked</Text>
              </View>
            </View>
          </View>
        ) : null}

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
  mediaUri?: string;
};

type ProductCollectionScreenProps = {
  activeMissionTitle?: string | null;
  evidence?: CollectionEvidence[];
  onContinue?: () => void;
  onEvidence?: (id: string) => void;
  onDiscover: () => void;
  onProfile?: () => void;
};

export const DEFAULT_COLLECTION_EVIDENCE: CollectionEvidence[] = [
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
  evidence,
  onContinue,
  onEvidence,
  onDiscover,
  onProfile,
}: ProductCollectionScreenProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const collectionEvidence = evidence ?? DEFAULT_COLLECTION_EVIDENCE;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleEvidence = collectionEvidence.filter((item) =>
    normalizedQuery.length === 0
      ? true
      : [item.title, item.note, item.day].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
  );

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
                {String(collectionEvidence.length).padStart(2, '0')}
              </Text>
              <View style={styles.discoveryCountDot} />
            </View>
            <Text style={styles.discoveryCountLabel}>FOUND</Text>
          </View>
        </View>

        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={20} color={colors.ink} />
          <TextInput
            accessibilityLabel="Search discoveries"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search discoveries"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear discovery search"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => [styles.searchClear, pressed && styles.pressed]}
            >
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {activeMissionTitle && onContinue ? (
          <MissionCard
            state="active"
            title={activeMissionTitle}
            description="Your current mission is saved locally and ready to continue."
            progressLabel="IN PROGRESS"
            progress={0.5}
            onPress={onContinue}
          />
        ) : null}

        <Text style={styles.completedLabel}>COMPLETED DISCOVERIES</Text>

        {visibleEvidence.length > 0 ? (
          visibleEvidence.map((item) => (
            <EvidenceCard
              key={item.id}
              layout="list"
              day={item.day}
              title={item.title}
              note={item.note}
              mediaUri={item.mediaUri}
              onPress={onEvidence ? () => onEvidence(item.id) : undefined}
            />
          ))
        ) : (
          <View style={styles.collectionSearchEmpty}>
            <Text style={styles.collectionSearchEmptyTitle}>
              {collectionEvidence.length === 0
                ? 'No discoveries yet'
                : 'No matching discoveries'}
            </Text>
            <Text style={styles.collectionSearchEmptyBody}>
              {collectionEvidence.length === 0
                ? 'Complete a mission to save your first discovery.'
                : 'Try a different title, note, or date.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FigmaBottomNavigation
        active="collection"
        onDiscover={onDiscover}
        onCollection={() => undefined}
        onProfile={onProfile}
      />
    </View>
  );
}

type ProductEvidenceDetailScreenProps = {
  title: string;
  day: string;
  note: string;
  media?: React.ReactNode;
  onBack: () => void;
  onEdit?: () => void;
  onShare?: () => void;
};

export function ProductEvidenceDetailScreen({
  title,
  day,
  note,
  media,
  onBack,
  onEdit,
  onShare,
}: ProductEvidenceDetailScreenProps) {
  return (
    <View style={styles.screen}>
      <FigmaTopBar title="Evidence detail" type="back" onLeading={onBack} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.evidenceDetailContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.savedBadge}>
          <View style={styles.savedBadgeDot} />
          <Text style={styles.savedBadgeText}>SAVED</Text>
        </View>

        <Text style={styles.evidenceDetailTitle}>{title}</Text>
        <Text style={styles.evidenceDetailMeta}>FIELD NOTE · {day}</Text>

        <View style={styles.evidenceDetailMedia}>
          {media ?? <EvidenceVisual size="detail" />}
        </View>

        <View style={styles.observationCard}>
          <Text style={styles.observationTitle}>Observation</Text>
          <Text style={styles.observationBody}>{note}</Text>
        </View>

        {onEdit ? <FigmaActionButton label="Edit note" outline onPress={onEdit} /> : null}
        {onShare ? (
          <FigmaActionButton label="Share discovery" outline onPress={onShare} />
        ) : null}
      </ScrollView>
    </View>
  );
}

type ProductProfileScreenProps = {
  name?: string;
  stats?: string;
  equippedTitle?: string | null;
  trophySummary?: {
    unlocked: number;
    total: number;
    featuredName?: string;
    featuredDescription?: string;
  };
  onDiscover: () => void;
  onCollection: () => void;
  onTrophies: () => void;
};

export function ProductProfileScreen({
  name = 'Tess',
  stats = '0 discoveries  ·  0 missions completed',
  equippedTitle,
  trophySummary = { unlocked: 0, total: 0 },
  onDiscover,
  onCollection,
  onTrophies,
}: ProductProfileScreenProps) {
  const [preferences, setPreferences] = React.useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES,
  );
  const [preferencesReady, setPreferencesReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    loadUserPreferences()
      .then((stored) => {
        if (mounted) setPreferences(stored);
      })
      .finally(() => {
        if (mounted) setPreferencesReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!preferencesReady) return;
    saveUserPreferences(preferences).catch(() => undefined);
  }, [preferences, preferencesReady]);

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <View style={styles.screen}>
      <FigmaTopBar title="Profile" type="root" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSummary}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={36} color={colors.white} />
          </View>
          <Text style={styles.profileName}>{name}</Text>
          {equippedTitle ? <Text style={styles.profileTitle}>{equippedTitle}</Text> : null}
          <Text style={styles.profileStats}>{stats}</Text>
        </View>

        <Pressable
          accessibilityLabel="View all trophies"
          accessibilityRole="button"
          onPress={onTrophies}
          style={({ pressed }) => [
            styles.profileTrophySection,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.profileSectionHeader}>
            <View style={styles.profileSectionTitleRow}>
              <Text style={styles.profileSectionTitle}>Trophies</Text>
              <View style={styles.profileClueDot} />
            </View>
            <Text style={styles.profileSectionLink}>
              {trophySummary.unlocked} / {trophySummary.total} · View all
            </Text>
          </View>

          <View style={styles.trophyCard}>
            <View style={styles.trophyIconStage}>
              <Ionicons name="trophy-outline" size={32} color={colors.blue} />
            </View>
            <View style={styles.trophyCopy}>
              <Text style={styles.trophyTitle}>
                {trophySummary.featuredName ?? 'No trophy unlocked yet'}
              </Text>
              <Text style={styles.trophyDescription}>
                {trophySummary.featuredDescription ?? 'Submit a mission to begin your Trophy Cabinet.'}
              </Text>
            </View>
            <View style={styles.trophyPill}>
              <Text style={styles.trophyPillText}>
                {trophySummary.featuredName ? 'Unlocked' : '0 / 1'}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.preferences}>
          <Text style={styles.preferencesTitle}>Preferences</Text>
          <PreferenceRow
            label="Mission reminders"
            value={preferences.missionReminders}
            disabled={!preferencesReady}
            onPress={() => togglePreference('missionReminders')}
          />
          <PreferenceRow
            label="Location access"
            value={preferences.locationAccess}
            disabled={!preferencesReady}
            onPress={() => togglePreference('locationAccess')}
          />
        </View>
      </ScrollView>

      <FigmaBottomNavigation
        active="profile"
        onDiscover={onDiscover}
        onCollection={onCollection}
        onProfile={() => undefined}
      />
    </View>
  );
}

function PreferenceRow({
  label,
  value,
  disabled = false,
  onPress,
}: {
  label: string;
  value: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.preferenceRow,
        disabled && styles.preferenceRowDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.preferenceLabel}>{label}</Text>
      <View style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

type TrophyCardState = 'unlocked' | 'progress' | 'locked';

function AchievementCard({
  trophy,
  onPress,
}: {
  trophy: TrophyEvaluation;
  onPress: () => void;
}) {
  const concealed = trophy.definition.hidden && !trophy.unlocked;
  const state: TrophyCardState = trophy.unlocked
    ? 'unlocked'
    : trophy.progress > 0 && !concealed
      ? 'progress'
      : 'locked';
  const title = concealed ? 'Secret Trophy' : trophy.definition.name;
  const description = concealed
    ? 'Keep exploring to reveal this hidden achievement.'
    : trophy.definition.description;
  const progress = trophy.unlocked
    ? trophy.equipped
      ? 'Equipped'
      : 'Unlocked'
    : concealed
      ? 'Locked'
      : `${Math.min(trophy.progress, trophy.target)} / ${trophy.target}`;

  return (
    <Pressable
      accessibilityRole={trophy.unlocked ? 'button' : undefined}
      disabled={!trophy.unlocked}
      onPress={onPress}
      style={[
        styles.achievementCard,
        state === 'progress' && styles.achievementCardProgress,
        state === 'locked' && styles.achievementCardLocked,
      ]}
    >
      <View
        style={[
          styles.achievementIconStage,
          state === 'locked' && styles.achievementIconStageLocked,
        ]}
      >
        <Ionicons
          name={concealed ? 'lock-closed-outline' : 'trophy-outline'}
          size={32}
          color={state === 'locked' ? colors.muted : colors.blue}
        />
      </View>
      <View style={styles.achievementCopy}>
        <Text
          style={[
            styles.achievementTitle,
            state === 'locked' && styles.achievementTitleLocked,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.achievementDescription,
            state === 'locked' && styles.achievementDescriptionLocked,
          ]}
        >
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.achievementPill,
          state === 'progress' && styles.achievementPillProgress,
          state === 'locked' && styles.achievementPillLocked,
        ]}
      >
        <Text
          style={[
            styles.achievementPillText,
            state === 'progress' && styles.achievementPillTextProgress,
            state === 'locked' && styles.achievementPillTextLocked,
          ]}
        >
          {progress}
        </Text>
      </View>
    </Pressable>
  );
}

type ProductTrophiesScreenProps = {
  trophies: TrophyEvaluation[];
  onEquipTitle: (trophyId: string) => void;
  onBack: () => void;
  onDiscover: () => void;
  onCollection: () => void;
};

export function ProductTrophiesScreen({
  trophies,
  onEquipTitle,
  onBack,
  onDiscover,
  onCollection,
}: ProductTrophiesScreenProps) {
  const [selectedTrophyId, setSelectedTrophyId] = React.useState<string | null>(null);
  const selectedTrophy = trophies.find(
    (item) => item.definition.id === selectedTrophyId && item.unlocked,
  );
  const unlocked = trophies.filter((item) => item.unlocked).length;
  const inProgress = trophies.filter(
    (item) => !item.unlocked && !item.definition.hidden && item.progress > 0,
  ).length;
  const hidden = trophies.filter(
    (item) => !item.unlocked && item.definition.hidden,
  ).length;
  const groups: TrophyEvaluation['definition']['group'][] = [
    'Achievement',
    'Extended',
    'Secret',
  ];

  return (
    <View style={styles.screen}>
      <FigmaTopBar title="Trophies & titles" type="back" onLeading={onBack} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.trophiesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trophiesIntro}>
          <Text style={styles.trophiesEyebrow}>ACHIEVEMENT FIELD LOG</Text>
          <Text style={styles.trophiesSummary}>
            {unlocked} unlocked · {inProgress} in progress · {hidden} hidden
          </Text>
          <Image source={{ uri: BRAND_MARK_URI }} style={styles.trophiesBrandMark} />
        </View>

        {selectedTrophy ? (
          <View style={styles.trophyDetailCard}>
            <Text style={styles.trophyDetailEyebrow}>TITLE UNLOCKED</Text>
            <Text style={styles.trophyDetailName}>{selectedTrophy.definition.name}</Text>
            <Text style={styles.trophyDetailTitle}>{selectedTrophy.definition.title}</Text>
            <Text style={styles.trophyDetailDescription}>
              {selectedTrophy.definition.description}
            </Text>
            {selectedTrophy.unlockedAt ? (
              <Text style={styles.trophyDetailDate}>
                Unlocked {new Date(selectedTrophy.unlockedAt).toLocaleDateString()}
              </Text>
            ) : null}
            <FigmaActionButton
              label={selectedTrophy.equipped ? 'Title equipped' : 'Equip title'}
              onPress={() => onEquipTitle(selectedTrophy.definition.id)}
              outline={selectedTrophy.equipped}
            />
          </View>
        ) : null}

        {groups.map((group) => {
          const groupTrophies = trophies.filter(
            (item) => item.definition.group === group,
          );
          if (groupTrophies.length === 0) return null;
          return (
            <View key={group} style={styles.trophyGroup}>
              <Text style={styles.trophyGroupLabel}>{group.toUpperCase()}</Text>
              {groupTrophies.map((item) => (
                <AchievementCard
                  key={item.definition.id}
                  trophy={item}
                  onPress={() => setSelectedTrophyId(item.definition.id)}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      <FigmaBottomNavigation
        active="profile"
        onDiscover={onDiscover}
        onCollection={onCollection}
        onProfile={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, width: '100%', backgroundColor: colors.white },
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
    height: 60,
    paddingHorizontal: 24,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    width: 88,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  navItemActive: { backgroundColor: colors.blueSubtle },
  navBrandIcon: { width: 22, height: 22, resizeMode: 'contain' },
  navLabel: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
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

  onboardingScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 393,
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  onboardingScroll: {
    width: '100%',
  },
  onboardingContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  onboardingLogo: {
    width: 216,
    height: 57,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  onboardingIllustration: {
    width: '100%',
    height: 239,
    resizeMode: 'contain',
    marginTop: 20,
  },
  onboardingTitleBlock: {
    width: '100%',
    paddingLeft: 18,
    marginTop: 24,
    gap: 14,
  },
  onboardingTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_700Bold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  onboardingBody: {
    width: '100%',
    maxWidth: 330,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  onboardingActions: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  onboardingPrimary: {
    width: '100%',
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  onboardingSecondary: {
    width: '100%',
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  onboardingFooter: {
    width: '100%',
    height: 14,
    marginTop: 14,
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textAlign: 'center',
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
  browseMissionNumber: {
    position: 'absolute',
    right: 16,
    top: 16,
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
  emptyFilterState: {
    width: '100%',
    minHeight: 112,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  emptyFilterTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  emptyFilterBody: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },

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
    borderTopLeftRadius: 0,
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

  evidenceReviewContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 16,
  },
  evidenceReviewTitleBlock: {
    width: '100%',
    gap: 24,
  },
  evidenceReviewTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  evidenceReviewMedia: {
    width: '100%',
    height: 342,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.ink,
    position: 'relative',
    overflow: 'hidden',
  },
  evidenceReviewMediaSlot: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceReviewBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    borderRadius: radius.full,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  evidenceReviewBadgeText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  evidenceReviewStatus: {
    width: '100%',
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  documentContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  documentTitleBlock: { width: '100%', gap: 12 },
  fieldNoteIndex: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
  },
  formField: { width: '100%', gap: 6 },
  formLabel: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  formInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 3,
    color: colors.ink,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'center',
  },
  formHelper: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  formInputError: {
    borderColor: colors.danger,
  },
  formHelperError: {
    color: colors.danger,
  },
  evidenceBanner: {
    width: '100%',
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.blueBanner,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  evidenceBannerCopy: { flex: 1, gap: 2 },
  evidenceBannerTitle: {
    color: '#12141A',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  evidenceBannerText: {
    color: '#596173',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  disabled: { opacity: 0.45 },
  confirmationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'flex-end',
  },
  confirmationScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 19, 24, 0.42)',
  },
  confirmationSheet: {
    width: '100%',
    height: 340,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 38,
    overflow: 'hidden',
  },
  confirmationHandle: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  confirmationTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  confirmationMessage: {
    height: 44,
    marginTop: 8,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  confirmationStatus: {
    width: '100%',
    height: 42,
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: colors.border,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  confirmationStatusText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 20,
  },
  confirmationActions: {
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  confirmationDiscard: {
    width: '100%',
    height: 20,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationDiscardText: {
    color: colors.danger,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 20,
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
  searchInput: {
    flex: 1,
    height: 46,
    paddingVertical: 0,
    color: colors.ink,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  searchClear: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionSearchEmpty: {
    width: '100%',
    minHeight: 112,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  collectionSearchEmptyTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  collectionSearchEmptyBody: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
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
  evidenceDetailContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  savedBadge: {
    width: 120,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savedBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
  savedBadgeText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  evidenceDetailTitle: {
    width: '100%',
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.24,
  },
  evidenceDetailMeta: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  evidenceDetailMedia: {
    width: '100%',
    height: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  observationCard: {
    width: '100%',
    minHeight: 130,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  observationTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  observationBody: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  profileContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
  },
  profileSummary: {
    width: '100%',
    minHeight: 198,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.24,
  },
  profileTitle: {
    color: colors.blue,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
  },
  profileStats: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  profileTrophySection: { width: '100%', height: 146, gap: 8 },
  profileSectionHeader: {
    width: '100%',
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileSectionTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  profileClueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  profileSectionLink: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  preferences: { width: '100%', gap: 10 },
  preferencesTitle: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  preferenceRow: {
    width: '100%',
    height: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceRowDisabled: { opacity: 0.6 },
  preferenceLabel: {
    flex: 1,
    color: colors.ink,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderStrong,
    padding: 3,
  },
  switchTrackOn: { backgroundColor: colors.blue },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  switchThumbOn: { marginLeft: 24 },

  trophiesContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  trophiesIntro: {
    width: '100%',
    height: 58,
    paddingBottom: 10,
    gap: 4,
    position: 'relative',
  },
  trophiesEyebrow: {
    color: colors.blue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.88,
  },
  trophiesSummary: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  trophiesBrandMark: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  trophyDetailCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: radius.lg,
    backgroundColor: colors.blueSubtle,
    padding: 18,
    gap: 8,
  },
  trophyDetailEyebrow: {
    color: colors.blue,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  trophyDetailName: {
    color: colors.ink,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
  trophyDetailTitle: {
    color: colors.blue,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.72,
  },
  trophyDetailDescription: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  trophyDetailDate: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  trophyGroup: { width: '100%', gap: 10 },
  trophyGroupLabel: {
    color: colors.muted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    marginTop: 6,
  },
  achievementCard: {
    width: '100%',
    height: 112,
    borderWidth: 1,
    borderColor: '#EAF9BF',
    borderRadius: radius.lg,
    backgroundColor: colors.limeSubtle,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  achievementCardProgress: {
    borderColor: '#E8EEFF',
    backgroundColor: colors.blueSubtle,
  },
  achievementCardLocked: {
    borderColor: colors.borderStrong,
    backgroundColor: '#FAFAFA',
  },
  achievementIconStage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconStageLocked: { backgroundColor: colors.border },
  achievementCopy: { flex: 1, gap: 4 },
  achievementTitle: {
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
  },
  achievementTitleLocked: { color: colors.text },
  achievementDescription: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  achievementDescriptionLocked: { color: colors.muted },
  achievementPill: {
    minWidth: 82,
    borderRadius: radius.full,
    backgroundColor: '#EAF9BF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  achievementPillProgress: {
    minWidth: 64,
    backgroundColor: '#E8EEFF',
  },
  achievementPillLocked: {
    minWidth: 72,
    backgroundColor: colors.border,
  },
  achievementPillText: {
    color: colors.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  achievementPillTextProgress: { color: colors.blue },
  achievementPillTextLocked: { color: colors.muted },

});
