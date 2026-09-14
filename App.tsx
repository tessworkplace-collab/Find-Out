import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  Archivo_600SemiBold,
  Archivo_700Bold,
  useFonts as useArchivoFonts,
} from '@expo-google-fonts/archivo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { otherDiscoveries, yourDiscovery } from './src/data';
import { BRAND_MARK_URI } from './src/brand';
import { colors, radius, typography } from './src/theme';
import { PublicationStatus, CommunityScreen } from './src/components/CommunityScreens';
import { readWebState, writeWebState, commitWebDiscovery, WebDiscovery, WebEvidence } from './src/webDiscoveryStorage';
import { WebEvidenceInput, WebEvidencePreview } from './src/components/WebEvidenceInput';
import {
  FEATURED_MISSION_ID,
  formatEvidenceModes,
  getMissionById,
  MISSIONS,
  MissionDefinition,
} from './src/missions';
import {
  getDailyDeckKey,
  getMissionDeck,
  getNextMissionRemix,
  getWeeklyCase,
  getWeeklyCaseProgress,
  MissionDeckCard,
  MissionRemix,
} from './src/missionPlay';
import {
  DEFAULT_TROPHY_STATE,
  equipTrophyTitle,
  evaluateTrophies,
  getEquippedTitle,
  loadTrophyState,
  recordEvidenceRetake,
  saveTrophyState,
  syncTrophyState,
  TrophyDiscovery,
  TrophyState,
  visibleTrophyCabinet,
} from './src/trophySystem';
import {
  CollectionEvidence,
  DEFAULT_COLLECTION_EVIDENCE,
  ProductCollectionScreen,
  ProductCompleteScreen,
  ProductDiscoverScreen,
  ProductDocumentScreen,
  ProductEvidenceDetailScreen,
  ProductEvidencePickerScreen,
  ProductEvidencePreviewScreen,
  ProductInvestigateScreen,
  ProductHowItWorksScreen,
  ProductMissionDetailScreen,
  ProductOnboardingScreen,
  ProductProfileScreen,
  ProductTrophiesScreen,
} from './src/components/FigmaProductScreens';

type Screen =
  | 'onboarding'
  | 'how-it-works'
  | 'discover'
  | 'mission-detail'
  | 'investigate'
  | 'evidence'
  | 'capture'
  | 'evidence-preview'
  | 'document'
  | 'mission-complete'
  | 'other-discoveries'
  | 'discovery-detail'
  | 'my-discoveries'
  | 'profile'
  | 'trophies'
  | 'evidence-detail'
  | 'share';

type CaptureMode = 'photo' | 'video' | 'audio';

function toTrophyDiscoveries(items: WebDiscovery[]): TrophyDiscovery[] {
  return items.map((item) => ({
    missionId: item.missionId,
    evidenceType: item.evidenceType,
    observation: item.note,
    location: item.location,
    completedAt: item.completedAt,
  }));
}

const brandMark = { uri: BRAND_MARK_URI };
const waveformBars = [18, 30, 22, 38, 26, 46, 24, 40, 28, 34, 20, 36, 24, 30, 18];

function AppText({ children, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      {...props}
      style={[{ color: colors.ink, fontFamily: 'Inter_400Regular' }, style]}
    >
      {children}
    </Text>
  );
}

function Button({
  label,
  onPress,
  outline = false,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        outline ? styles.outlineButton : styles.primaryButton,
        pressed && { opacity: 0.82 },
      ]}
    >
      <AppText style={outline ? styles.outlineButtonText : styles.primaryButtonText}>
        {label}
      </AppText>
    </Pressable>
  );
}

function TopBar({
  title,
  type = 'back',
  onBack,
  onProfile,
}: {
  title: string;
  type?: 'back' | 'root' | 'close';
  onBack?: () => void;
  onProfile?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={type === 'root' ? undefined : onBack} style={styles.hit}>
        {type === 'root' ? (
          <Image source={brandMark} style={styles.topMark} />
        ) : (
          <Ionicons
            name={type === 'close' ? 'close' : 'chevron-back'}
            size={24}
            color={colors.ink}
          />
        )}
      </Pressable>

      <AppText style={styles.topTitle}>{title}</AppText>

      <Pressable onPress={type === 'root' ? onProfile : undefined} style={styles.hit}>
        <Ionicons
          name={type === 'root' ? 'person-outline' : 'ellipsis-horizontal'}
          size={23}
          color={colors.ink}
        />
      </Pressable>
    </View>
  );
}

const stageIndex = { Notice: 0, Investigate: 1, Document: 2, Submit: 3 } as const;

function Stepper({ stage }: { stage: keyof typeof stageIndex }) {
  const steps = ['Notice', 'Investigate', 'Document', 'Submit'] as const;

  return (
    <View style={styles.stepper}>
      {steps.map((step, i) => {
        const active = i === stageIndex[stage];
        const done = i < stageIndex[stage];

        return (
          <View style={styles.stepItem} key={step}>
            <View
              style={[
                styles.stepCircle,
                active && styles.stepActive,
                done && styles.stepDone,
              ]}
            >
              <AppText
                style={[
                  styles.stepNum,
                  active && { color: colors.white },
                  done && { color: colors.ink },
                ]}
              >
                {i + 1}
              </AppText>
            </View>
            <AppText
              style={[
                styles.stepLabel,
                active && { color: colors.blue },
                done && { color: colors.ink },
              ]}
            >
              {step}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function SavedEvidenceCard({
  title,
  category,
  note,
  icon = 'image-outline',
  onPress,
}: {
  title: string;
  category: string;
  note: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.savedEvidenceCard,
        pressed && { opacity: 0.82 },
      ]}
    >
      <View style={styles.savedEvidenceVisual}>
        <View style={styles.savedEvidenceIcon}>
          <Ionicons name={icon} size={18} color={colors.blue} />
        </View>
      </View>
      <AppText numberOfLines={2} style={styles.savedEvidenceTitle}>
        {title}
      </AppText>
      <AppText style={styles.savedEvidenceMeta}>{category} · TODAY</AppText>
      <AppText numberOfLines={3} style={styles.savedEvidenceNote}>
        {note}
      </AppText>
    </Pressable>
  );
}

function BottomNav({
  active,
  go,
}: {
  active: 'discover' | 'mission' | 'profile';
  go: (s: Screen) => void;
}) {
  const Item = ({
    id,
    label,
    icon,
    target,
  }: {
    id: 'discover' | 'mission' | 'profile';
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    target: Screen;
  }) => (
    <Pressable
      onPress={() => go(target)}
      style={[styles.navItem, active === id && styles.navItemActive]}
    >
      {id === 'discover' ? (
        <Image source={brandMark} style={styles.navMark} />
      ) : (
        <Ionicons
          name={icon}
          size={24}
          color={active === id ? colors.blue : colors.muted}
        />
      )}
      <AppText style={[styles.navLabel, active === id && { color: colors.blue }]}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <View style={styles.bottomNav}>
      <Item
        id="discover"
        label="Discover"
        icon="compass-outline"
        target="discover"
      />
      <Item
        id="mission"
        label="Mission"
        icon="flag-outline"
        target="my-discoveries"
      />
      <Item id="profile" label="Profile" icon="person-outline" target="profile" />
    </View>
  );
}

function Frame({ children, nav }: { children: React.ReactNode; nav?: React.ReactNode }) {
  return (
    <View style={styles.screen}>
      <View style={{ flex: 1 }}>{children}</View>
      {nav}
    </View>
  );
}

function TitleBlock({ title, body }: { title: string; body?: string }) {
  return (
    <View style={{ gap: 24 }}>
      <AppText style={styles.h1}>{title}</AppText>
      {body ? <AppText style={styles.body}>{body}</AppText> : null}
    </View>
  );
}

function MissionNumber({ number }: { number: string }) {
  return (
    <View style={styles.missionNumber}>
      <View style={styles.cornerTop} />
      <View style={styles.cornerLeft} />
      <AppText style={styles.numberText}>{number}</AppText>
      <View style={styles.numberDot} />
    </View>
  );
}

function Onboarding({ go }: { go: (s: Screen) => void }) {
  return (
    <ProductOnboardingScreen
      onStart={() => go('discover')}
      onHowItWorks={() => go('how-it-works')}
    />
  );
}

function Discover({
  go,
  missionDeck,
  missionDeckRevealed,
  refreshesRemaining,
  activeMissionId,
  completedMissionIds,
  onDrawMissionDeck,
  onShuffleMissionDeck,
  onOpenMission,
}: {
  go: (s: Screen) => void;
  missionDeck: MissionDeckCard[];
  missionDeckRevealed: boolean;
  refreshesRemaining: number;
  activeMissionId: string | null;
  completedMissionIds: string[];
  onDrawMissionDeck: () => void;
  onShuffleMissionDeck: () => void;
  onOpenMission: (missionId: string) => void;
}) {
  return (
    <ProductDiscoverScreen
      missions={MISSIONS}
      missionDeck={missionDeck}
      missionDeckRevealed={missionDeckRevealed}
      refreshesRemaining={refreshesRemaining}
      activeMissionId={activeMissionId}
      completedMissionIds={completedMissionIds}
      onDrawMissionDeck={onDrawMissionDeck}
      onShuffleMissionDeck={onShuffleMissionDeck}
      onOpenMission={onOpenMission}
      onCollection={() => go('my-discoveries')}
      onProfile={() => go('profile')}
    />
  );
}

function MissionDetail({
  back,
  mission,
  onOpen,
}: {
  back: () => void;
  mission: MissionDefinition;
  onOpen: () => void;
}) {
  return (
    <ProductMissionDetailScreen
      number={mission.number}
      difficulty={mission.difficulty.toUpperCase()}
      evidence={formatEvidenceModes(mission.evidenceModes)}
      title={mission.title}
      summary={mission.prompt}
      question={mission.question}
      guidance={`${mission.find} ${mission.investigate}`}
      onBack={back}
      onOpen={onOpen}
    />
  );
}

function Investigate({
  go,
  back,
  mission,
  remix,
}: {
  go: (s: Screen) => void;
  back: () => void;
  mission: MissionDefinition;
  remix?: MissionRemix | null;
}) {
  return (
    <ProductInvestigateScreen
      question={mission.question}
      remix={remix}
      onBack={back}
      onExit={() => go('discover')}
      onFound={() => go('evidence')}
    />
  );
}

function Evidence({
  go,
  back,
  mission,
  remix,
}: {
  go: (s: Screen) => void;
  back: () => void;
  mission: MissionDefinition;
  remix?: MissionRemix | null;
}) {
  return (
    <ProductEvidencePickerScreen
      onBack={back}
      onExit={() => go('discover')}
      onSelect={(mode) => goCapture(go, mode)}
      allowedModes={remix?.evidenceMode ? [remix.evidenceMode] : mission.evidenceModes}
    />
  );
}

let pendingCapture: CaptureMode = 'audio';

function goCapture(go: (s: Screen) => void, mode: CaptureMode) {
  pendingCapture = mode;
  go('capture');
}

function AudioWaveform() {
  return (
    <View style={styles.audioWaveform}>
      {waveformBars.map((height, index) => (
        <View key={`${height}-${index}`} style={[styles.waveBar, { height }]} />
      ))}
    </View>
  );
}

function Capture({
  mode,
  go,
  back,
}: {
  mode: CaptureMode;
  go: (s: Screen) => void;
  back: () => void;
}) {
  if (mode === 'photo') {
    return (
      <Frame>
        <TopBar title="Take photo" onBack={back} />
        <ScrollView contentContainerStyle={styles.captureContent}>
          <View style={styles.captureTitleBlock}>
            <AppText style={styles.captureTitle}>Frame your discovery</AppText>
            <AppText style={styles.body}>
              Keep the subject clear before you capture it.
            </AppText>
          </View>

          <View style={styles.cameraLargePanel}>
            <View style={styles.photoModeBadge}>
              <View style={styles.photoModeDot} />
              <AppText style={styles.cameraBadgeText}>PHOTO</AppText>
            </View>
            <Ionicons name="camera-outline" size={64} color={colors.blue} />
          </View>

          <View style={styles.photoControls}>
            <View style={styles.photoControlItem}>
              <View style={styles.photoSideButton}>
                <View style={styles.galleryThumb} />
              </View>
              <AppText style={styles.photoControlLabel}>Gallery</AppText>
            </View>

            <Pressable
              onPress={() => go('evidence-preview')}
              style={({ pressed }) => [
                styles.shutterOuter,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <View style={styles.shutterInner} />
            </Pressable>

            <View style={styles.photoControlItem}>
              <View style={styles.photoSideButton}>
                <Ionicons name="refresh" size={30} color={colors.blue} />
              </View>
              <AppText style={styles.photoControlLabel}>Flip</AppText>
            </View>
          </View>
        </ScrollView>
      </Frame>
    );
  }

  if (mode === 'video') {
    return (
      <Frame>
        <TopBar title="Record video" onBack={back} />
        <ScrollView contentContainerStyle={styles.captureContent}>
          <View style={styles.captureTitleBlock}>
            <AppText style={styles.captureTitle}>Capture what you found</AppText>
            <AppText style={styles.body}>
              Keep the discovery in frame while recording.
            </AppText>
          </View>

          <View style={styles.cameraLargePanel}>
            <View style={styles.recordingBadge}>
              <View style={styles.recordDot} />
              <AppText style={styles.cameraBadgeText}>00:12</AppText>
            </View>
            <Ionicons name="videocam-outline" size={64} color={colors.white} />
          </View>

          <AppText style={styles.captureStatus}>Recording video…</AppText>
          <Button label="Stop & preview" onPress={() => go('evidence-preview')} />
        </ScrollView>
      </Frame>
    );
  }

  return (
    <Frame>
      <TopBar title="Record audio" onBack={back} />
      <ScrollView contentContainerStyle={styles.captureContent}>
        <View style={styles.captureTitleBlock}>
          <AppText style={styles.captureTitle}>Capture the sound</AppText>
          <AppText style={styles.body}>
            Stay nearby and capture the sound clearly.
          </AppText>
        </View>

        <View style={styles.audioLargePanel}>
          <Ionicons name="mic-outline" size={72} color={colors.blue} />
          <AudioWaveform />
          <AppText style={styles.audioTimer}>00:18</AppText>
        </View>

        <AppText style={styles.captureStatus}>Recording audio…</AppText>
        <Button label="Stop & preview" onPress={() => go('evidence-preview')} />
      </ScrollView>
    </Frame>
  );
}

function EvidencePreview({
  mode,
  go,
  back,
  onRetake,
}: {
  mode: CaptureMode;
  go: (s: Screen) => void;
  back: () => void;
  onRetake?: () => void;
}) {
  const label =
    mode === 'photo' ? 'PHOTO' : mode === 'video' ? 'VIDEO · 00:12' : 'AUDIO · 00:18';

  const media = (
    <View style={styles.sharedPreviewMedia}>
      {mode === 'photo' ? (
        <Ionicons name="camera-outline" size={64} color={colors.white} />
      ) : (
        <View style={styles.sharedPreviewPlayButton}>
          <Ionicons name="play" size={34} color={colors.white} />
        </View>
      )}
    </View>
  );

  return (
    <ProductEvidencePreviewScreen
      media={media}
      mediaLabel={label}
      onBack={back}
      onExit={() => go('discover')}
      onUse={() => go('document')}
      onRetake={onRetake ?? (() => go('capture'))}
    />
  );
}

function Document({
  go,
  back,
  initialObservation = '',
  initialLocation = '',
  editing = false,
  onCancel,
  onSave,
  draft,
  busy = false,
  saveError = '',
  onDiscardDraft,
}: {
  go: (s: Screen) => void;
  back: () => void;
  initialObservation?: string;
  initialLocation?: string;
  editing?: boolean;
  onCancel?: () => void;
  onSave?: (observation: string, location: string) => void;
  draft?: { observation: string; location: string; change: (observation: string, location: string) => void };
  busy?: boolean;
  saveError?: string;
  onDiscardDraft?: () => void;
}) {
  const [obs, setObs] = useState(initialObservation);
  const [loc, setLoc] = useState(initialLocation);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const cancel = onCancel ?? (() => go('discover'));
  const useCurrentLocation = () => new Promise<void>((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Location is unavailable. Enter a place manually.')); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        );
        if (!response.ok) throw new Error('Place lookup failed. Try again or enter a place manually.');
        const result = await response.json();
        const address = result.address ?? {};
        const suggestions = [...new Set([
          result.name,
          [address.road, address.suburb].filter(Boolean).join(', '),
          [address.city ?? address.town ?? address.village, address.state].filter(Boolean).join(', '),
        ].filter(Boolean))] as string[];
        setLocationSuggestions(suggestions);
        if (!suggestions.length) throw new Error('No place name found. Enter a place manually.');
        setLoc(suggestions[0]);
        draft?.change(draft.observation, suggestions[0]);
        resolve();
      } catch (error) { reject(error); }
    }, () => reject(new Error('Location unavailable. Check permission and try again, or enter a place manually.')), { timeout: 15000 });
  });

  return (
    <ProductDocumentScreen
      observation={draft?.observation ?? obs}
      location={draft?.location ?? loc}
      onChangeObservation={(value) => { setObs(value); draft?.change(value, draft.location); }}
      onChangeLocation={(value) => { setLoc(value); draft?.change(draft.observation, value); }}
      onUseCurrentLocation={useCurrentLocation}
      locationSuggestions={locationSuggestions}
      onBack={editing ? cancel : back}
      onExit={editing ? undefined : cancel}
      onDiscard={editing ? undefined : onDiscardDraft ?? cancel}
      onSubmit={() => (onSave ? onSave(draft?.observation ?? obs, draft?.location ?? loc) : go('mission-complete'))}
      submitLabel={busy ? 'Saving…' : editing ? 'Save changes' : 'Submit discovery'}
      submitDisabled={busy}
      saveError={saveError}
    />
  );
}

function MissionComplete({
  go,
  unlockedTrophy,
  onExplore,
  onRemix,
  publicationStatus,
}: {
  go: (s: Screen) => void;
  unlockedTrophy?: { name: string; description: string } | null;
  onExplore: () => void;
  onRemix: () => void;
  publicationStatus?: React.ReactNode;
}) {
  return (
    <ProductCompleteScreen
      publicationStatus={publicationStatus}
      onClose={() => go('discover')}
      onOtherDiscoveries={() => go('other-discoveries')}
      onExplore={onExplore}
      onRemix={onRemix}
      unlockedTrophy={unlockedTrophy}
    />
  );
}

function DiscoveryDetail({
  back,
  mission,
}: {
  back: () => void;
  mission: MissionDefinition;
}) {
  const d = otherDiscoveries[0];

  return (
    <Frame>
      <TopBar title="Other discovery" onBack={back} />
      <ScrollView contentContainerStyle={styles.detail}>
        <AppText style={styles.eyebrow}>
          {mission.title.toUpperCase()}  ·  SAME MISSION
        </AppText>
        <AppText style={styles.detailTitle}>{d.title}</AppText>
        <AppText style={styles.label}>{d.location}</AppText>

        <View style={styles.audioDetail}>
          <View style={styles.wave}>
            {[16, 30, 40, 26, 44, 34, 42, 30, 24].map((height, index) => (
              <View key={index} style={[styles.waveBar, { height }]} />
            ))}
          </View>
          <AppText style={styles.smallMuted}>Submitted audio</AppText>
          <AppText style={styles.helper}>00:08</AppText>
        </View>

        <AppText style={styles.eyebrow}>FINDING</AppText>
        <AppText style={styles.finding}>{d.note}</AppText>
        <AppText style={styles.label}>Same mission as yours</AppText>

        <View style={styles.report}>
          <Ionicons name="ellipsis-horizontal" size={20} />
          <AppText style={styles.smallMuted}>Report discovery</AppText>
        </View>

        <Button outline label="Back to other discoveries" onPress={back} />
      </ScrollView>
    </Frame>
  );
}

function MyDiscoveries({
  go,
  evidence,
  activeMissionTitle,
  onContinue,
  onSelectEvidence,
}: {
  go: (s: Screen) => void;
  evidence: CollectionEvidence[];
  activeMissionTitle?: string | null;
  onContinue?: () => void;
  onSelectEvidence: (id: string) => void;
}) {
  return (
    <ProductCollectionScreen
      activeMissionTitle={activeMissionTitle}
      evidence={evidence}
      onContinue={onContinue}
      onEvidence={(id) => {
        onSelectEvidence(id);
        go('evidence-detail');
      }}
      onDiscover={() => go('discover')}
      onProfile={() => go('profile')}
    />
  );
}

function Profile({
  go,
  stats,
  equippedTitle,
  trophySummary,
}: {
  go: (s: Screen) => void;
  stats: string;
  equippedTitle: string | null;
  trophySummary: React.ComponentProps<typeof ProductProfileScreen>['trophySummary'];
}) {
  return (
    <ProductProfileScreen
      stats={stats}
      equippedTitle={equippedTitle}
      trophySummary={trophySummary}
      onDiscover={() => go('discover')}
      onCollection={() => go('my-discoveries')}
      onTrophies={() => go('trophies')}
    />
  );
}

function Trophies({
  go,
  back,
  trophies,
  onEquipTitle,
}: {
  go: (s: Screen) => void;
  back: () => void;
  trophies: React.ComponentProps<typeof ProductTrophiesScreen>['trophies'];
  onEquipTitle: (trophyId: string) => void;
}) {
  return (
    <ProductTrophiesScreen
      trophies={trophies}
      onEquipTitle={onEquipTitle}
      onBack={back}
      onDiscover={() => go('discover')}
      onCollection={() => go('my-discoveries')}
    />
  );
}

function EvidenceDetail({
  go,
  back,
  evidence,
  onEdit,
}: {
  go: (s: Screen) => void;
  back: () => void;
  evidence: WebDiscovery;
  onEdit: () => void;
}) {
  return (
    <ProductEvidenceDetailScreen
      title={evidence.title}
      media={<WebEvidencePreview evidence={evidence.evidence} />}
      publicationStatus={<PublicationStatus key={evidence.id} item={{ id: evidence.id, missionTitle: evidence.title, observation: evidence.note, location: evidence.location }} />}
      day={evidence.day}
      note={evidence.note}
      onBack={back}
      onEdit={onEdit}
      onShare={() => go('share')}
    />
  );
}

function Share({ back }: { back: () => void }) {
  return (
    <Frame>
      <TopBar title="Share discovery" onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <TitleBlock
          title="Choose how to share"
          body="Choose how this field note leaves the app."
        />

        <View style={styles.shareCard}>
          <AppText style={styles.eyebrowBlue}>FIELD NOTE · 03</AppText>
          <View style={styles.shareBody}>
            <Image source={brandMark} style={{ width: 86, height: 86 }} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.h3}>The place has changed</AppText>
              <AppText style={styles.smallMuted}>
                A different shop now occupies the address.
              </AppText>
            </View>
          </View>
          <AppText style={styles.eyebrow}>FIND OUT  ·  OPEN DISCOVERY</AppText>
        </View>

        <View style={styles.shareGrid}>
          {['Stories', 'Post', 'Copy link', 'Save image'].map((label, index) => (
            <View
              key={label}
              style={[
                styles.shareOption,
                index === 0 && {
                  backgroundColor: colors.blueSubtle,
                  borderColor: colors.blue,
                },
              ]}
            >
              <Ionicons
                name={
                  index === 0
                    ? 'add-circle-outline'
                    : index === 1
                      ? 'image-outline'
                      : index === 2
                        ? 'link-outline'
                        : 'download-outline'
                }
                size={24}
                color={colors.blue}
              />
              <AppText style={styles.label}>{label}</AppText>
            </View>
          ))}
        </View>

        <AppText style={styles.smallMuted}>
          Only this card is shared. Your precise location stays private.
        </AppText>
        <Button label="Open share sheet" onPress={() => {}} />
      </ScrollView>
    </Frame>
  );
}

export default function App() {
  const [aLoaded] = useArchivoFonts({ Archivo_600SemiBold, Archivo_700Bold });
  const [iLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [screen, setScreen] = useState<Screen>('onboarding');
  const [history, setHistory] = useState<Screen[]>([]);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [selectedMissionId, setSelectedMissionId] = useState(FEATURED_MISSION_ID);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeRemix, setActiveRemix] = useState<MissionRemix | null>(null);
  const [missionDeckSeed] = useState(() => getDailyDeckKey());
  const [missionDeckRevealed, setMissionDeckRevealed] = useState(true);
  const [missionDeckShuffleRound, setMissionDeckShuffleRound] = useState(0);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [collectionEvidence, setCollectionEvidence] = useState<WebDiscovery[]>([]);
  const [capturedEvidence, setCapturedEvidence] = useState<WebEvidence | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  type Draft = { missionId: string | null; evidence: WebEvidence | null; observation: string; location: string };
  useEffect(() => {
    let mounted = true;
    Promise.all([readWebState<WebDiscovery[]>('discoveries'), readWebState<Draft>('draft')])
      .then(([items, draft]) => {
        if (!mounted) return;
        setCollectionEvidence(items ?? []);
        setSelectedEvidenceId(items?.[0]?.id ?? '');
        if (draft?.missionId && getMissionById(draft.missionId)) {
          setActiveMissionId(draft.missionId); setSelectedMissionId(draft.missionId);
          setCapturedEvidence(draft.evidence); setDraftNote(draft.observation); setDraftLocation(draft.location);
          if (draft.evidence) setCaptureMode(draft.evidence.type);
        }
        setStorageReady(true);
      }).catch(() => { if (mounted) setStorageError('Could not open saved discoveries. Enable browser storage, then reload.'); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!storageReady || saving) return;
    const timer = setTimeout(() => {
      writeWebState('draft', { missionId: activeMissionId, evidence: capturedEvidence, observation: draftNote, location: draftLocation })
        .catch(() => setSaveError('Draft could not be saved. Check browser storage space.'));
    }, 250);
    return () => clearTimeout(timer);
  }, [storageReady, saving, activeMissionId, capturedEvidence, draftNote, draftLocation]);
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [trophyState, setTrophyState] = useState<TrophyState>(DEFAULT_TROPHY_STATE);
  const [lastUnlockedTrophyId, setLastUnlockedTrophyId] = useState<string | null>(null);

  const selectedMission = getMissionById(selectedMissionId) ?? MISSIONS[0];
  const activeMission = getMissionById(activeMissionId);
  const flowMission = activeMission ?? selectedMission;
  const completedMissionIds = useMemo(
    () => [...new Set(collectionEvidence.map((item) => item.missionId))],
    [collectionEvidence],
  );
  const trophyEvaluations = useMemo(
    () => evaluateTrophies(toTrophyDiscoveries(collectionEvidence), trophyState),
    [collectionEvidence, trophyState],
  );
  const trophyCabinet = useMemo(
    () => visibleTrophyCabinet(trophyEvaluations),
    [trophyEvaluations],
  );
  const missionDeck = useMemo(
    () => getMissionDeck(missionDeckSeed, missionDeckShuffleRound, completedMissionIds),
    [missionDeckSeed, missionDeckShuffleRound, completedMissionIds],
  );
  const weeklyCase = useMemo(() => getWeeklyCase(), []);
  const weeklyCaseProgress = useMemo(
    () => getWeeklyCaseProgress(collectionEvidence, weeklyCase),
    [collectionEvidence, weeklyCase],
  );

  useEffect(() => {
    let mounted = true;
    loadTrophyState().then(async (stored) => {
      if (!mounted) return;
      const saved = await readWebState<WebDiscovery[]>('discoveries');
        const synced = syncTrophyState(toTrophyDiscoveries(saved ?? []), stored);
      setTrophyState(synced.state);
      saveTrophyState(synced.state).catch(() => undefined);
    }).catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const go = (next: Screen) => {
    if (next === 'capture') setCaptureMode(pendingCapture);
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const back = () =>
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop() ?? 'discover';
      setScreen(prev);
      return copy;
    });

  const openMission = (missionId: string) => {
    if (!getMissionById(missionId)) return;
    setSelectedMissionId(missionId);
    go('mission-detail');
  };

  const beginMission = () => {
    if (activeMissionId === selectedMission.id) { go(capturedEvidence ? 'document' : 'investigate'); return; }
    if (activeMissionId && !window.confirm('Replace your unfinished mission and its draft?')) return;
    setCapturedEvidence(null); setDraftNote(''); setDraftLocation(''); setSaveError('');
    setActiveMissionId(selectedMission.id);
    setActiveRemix(null);
    setCaptureMode(selectedMission.evidenceModes[0] ?? 'photo');
    setLastUnlockedTrophyId(null);
    go('investigate');
  };

  const updateTrophiesFor = (discoveries: WebDiscovery[], state = trophyState) => {
    const synced = syncTrophyState(toTrophyDiscoveries(discoveries), state);
    setTrophyState(synced.state);
    saveTrophyState(synced.state).catch(() => undefined);
    return synced;
  };

  const submitMission = async (observation: string, discoveryLocation: string) => {
    if (saveLock.current || !capturedEvidence) return;
    saveLock.current = true; setSaving(true); setSaveError('');
    try {
    const completed: WebDiscovery = {
      id: `${flowMission.id}-${Date.now()}`,
      missionId: flowMission.id,
      evidenceType: capturedEvidence.type,
      evidence: capturedEvidence,
      mediaUri: capturedEvidence.type === 'photo' ? capturedEvidence.uri : undefined,
      title: flowMission.title,
      note: observation,
      location: discoveryLocation,
      completedAt: new Date().toISOString(),
      day: 'TODAY',
    };
    const next = [completed, ...collectionEvidence];
    await commitWebDiscovery(next);
    setCollectionEvidence(next);
    setActiveMissionId(null);
    setSelectedEvidenceId(completed.id);
    const synced = updateTrophiesFor(next);
    setLastUnlockedTrophyId(synced.newlyUnlocked[0] ?? null);
    setCapturedEvidence(null); setDraftNote(''); setDraftLocation('');
    go('mission-complete');
    } catch { setSaveError('Could not save discovery. Check browser storage space and retry.'); }
    finally { saveLock.current = false; setSaving(false); }
  };

  const exploreAnotherMission = () => {
    setActiveMissionId(null);
    setActiveRemix(null);
    setSelectedMissionId(FEATURED_MISSION_ID);
    setLastUnlockedTrophyId(null);
    go('discover');
  };

  const remixMission = () => {
    setCapturedEvidence(null); setDraftNote(''); setDraftLocation('');
    const previous = collectionEvidence.find(
      (item) => item.missionId === flowMission.id,
    );
    const completionCount = collectionEvidence.filter(
      (item) => item.missionId === flowMission.id,
    ).length;
    const remix = getNextMissionRemix(
      flowMission.id,
      completionCount,
      previous?.evidenceType,
    );
    setSelectedMissionId(flowMission.id);
    setActiveMissionId(flowMission.id);
    setActiveRemix(remix);
    setCaptureMode(remix.evidenceMode ?? flowMission.evidenceModes[0] ?? 'photo');
    setLastUnlockedTrophyId(null);
    go('investigate');
  };

  const retakeEvidence = () => {
    const nextState = recordEvidenceRetake(trophyState, flowMission.id);
    setTrophyState(nextState);
    saveTrophyState(nextState).catch(() => undefined);
    go('capture');
  };

  const handleEquipTitle = (trophyId: string) => {
    if (!trophyEvaluations.some((item) => item.definition.id === trophyId && item.unlocked)) {
      return;
    }
    const nextState = equipTrophyTitle(trophyState, trophyId);
    setTrophyState(nextState);
    saveTrophyState(nextState).catch(() => undefined);
  };

  const content = useMemo(() => {
    switch (screen) {
      case 'onboarding':
        return <Onboarding go={go} />;
      case 'how-it-works':
        return <ProductHowItWorksScreen onBack={back} onStart={() => go('discover')} />;
      case 'discover':
        return (
          <Discover
            go={go}
            missionDeck={missionDeck}
            missionDeckRevealed={missionDeckRevealed}
            refreshesRemaining={Math.max(0, 2 - missionDeckShuffleRound)}
            activeMissionId={activeMissionId}
            completedMissionIds={completedMissionIds}
            onDrawMissionDeck={() => setMissionDeckRevealed(true)}
            onShuffleMissionDeck={() => setMissionDeckShuffleRound((round) => Math.min(2, round + 1))}
            onOpenMission={openMission}
          />
        );
      case 'mission-detail':
        return <MissionDetail back={back} mission={selectedMission} onOpen={beginMission} />;
      case 'investigate':
        return <Investigate go={go} back={back} mission={flowMission} remix={activeRemix} />;
      case 'evidence':
        return <Evidence go={go} back={back} mission={flowMission} remix={activeRemix} />;
      case 'capture':
        return <WebEvidenceInput mode={captureMode} onBack={back} onSelect={(value) => { setCapturedEvidence(value); go('evidence-preview'); }} />;
      case 'evidence-preview':
        return capturedEvidence ? <ProductEvidencePreviewScreen
          media={<WebEvidencePreview evidence={capturedEvidence} />} mediaLabel={capturedEvidence.name}
          onBack={back} onExit={() => go('discover')} onUse={() => go('document')}
          onRetake={retakeEvidence}
        /> : <WebEvidenceInput mode={captureMode} onBack={back} onSelect={(value) => { setCapturedEvidence(value); go('evidence-preview'); }} />;
      case 'document':
        if (editingEvidenceId) {
          const editingEvidence = collectionEvidence.find(
            (item) => item.id === editingEvidenceId,
          );
          return (
            <Document
              go={go}
              back={back}
              editing
              initialObservation={editingEvidence?.note}
              initialLocation={editingEvidence?.location}
              onCancel={() => {
                setEditingEvidenceId(null);
                back();
              }}
              busy={saving}
              saveError={saveError}
              onSave={async (observation, discoveryLocation) => {
                if (saveLock.current) return;
                saveLock.current = true; setSaving(true); setSaveError('');
                try {
                const next = collectionEvidence.map((item) =>
                  item.id === editingEvidenceId
                    ? { ...item, note: observation, location: discoveryLocation }
                    : item,
                );
                await writeWebState('discoveries', next);
                setCollectionEvidence(next);
                updateTrophiesFor(next);
                setEditingEvidenceId(null);
                setHistory((current) =>
                  current.at(-1) === 'evidence-detail' ? current.slice(0, -1) : current,
                );
                setScreen('evidence-detail');
                } catch { setSaveError('Could not save changes. Please retry.'); }
                finally { saveLock.current = false; setSaving(false); }
              }}
            />
          );
        }
        return <Document go={go} back={back} onSave={submitMission} busy={saving || !capturedEvidence} saveError={saveError}
          onDiscardDraft={() => { setCapturedEvidence(null); setActiveMissionId(null); setDraftNote(''); setDraftLocation(''); go('discover'); }}
          draft={{ observation: draftNote, location: draftLocation, change: (note, place) => { setDraftNote(note); setDraftLocation(place); } }} />;
      case 'mission-complete':
        return (
          <MissionComplete
            publicationStatus={collectionEvidence.find(item => item.id === selectedEvidenceId) ? <PublicationStatus
              key={selectedEvidenceId}
              item={{ id: selectedEvidenceId, missionTitle: collectionEvidence.find(item => item.id === selectedEvidenceId)!.title,
                observation: collectionEvidence.find(item => item.id === selectedEvidenceId)!.note,
                location: collectionEvidence.find(item => item.id === selectedEvidenceId)!.location }} /> : undefined}
            go={go}
            onExplore={exploreAnotherMission}
            onRemix={remixMission}
            unlockedTrophy={
              trophyEvaluations.find(
                (item) => item.definition.id === lastUnlockedTrophyId,
              )?.definition ?? null
            }
          />
        );
      case 'other-discoveries':
        {
          const own = collectionEvidence.find(item => item.id === selectedEvidenceId);
          return own ? <CommunityScreen item={{ id: own.id, missionTitle: own.title, observation: own.note, location: own.location }}
            prompt={getMissionById(own.missionId)?.prompt ?? ''} onBack={back} onExplore={exploreAnotherMission} /> : null;
        }
      case 'discovery-detail':
        return <DiscoveryDetail back={back} mission={flowMission} />;
      case 'my-discoveries':
        return (
          <MyDiscoveries
            go={go}
            evidence={collectionEvidence}
            activeMissionTitle={activeMission?.title}
            onContinue={activeMission ? () => go(capturedEvidence ? 'document' : 'investigate') : undefined}
            onSelectEvidence={setSelectedEvidenceId}
          />
        );
      case 'profile':
        return (
          <Profile
            go={go}
            stats={`${collectionEvidence.length} discoveries  ·  ${completedMissionIds.length} missions completed`}
            equippedTitle={getEquippedTitle(trophyState)}
            trophySummary={{
              unlocked: trophyCabinet.filter((item) => item.unlocked).length,
              total: trophyCabinet.length,
              featuredName: trophyCabinet.find((item) => item.equipped)?.definition.name ??
                trophyCabinet.find((item) => item.unlocked)?.definition.name,
              featuredDescription: trophyCabinet.find((item) => item.equipped)?.definition.description ??
                trophyCabinet.find((item) => item.unlocked)?.definition.description,
            }}
          />
        );
      case 'trophies':
        return (
          <Trophies
            go={go}
            back={back}
            trophies={trophyCabinet}
            onEquipTitle={handleEquipTitle}
          />
        );
      case 'evidence-detail':
        return (
          <EvidenceDetail
            go={go}
            back={back}
            evidence={
              collectionEvidence.find(
                (item) => item.id === selectedEvidenceId,
              ) ?? collectionEvidence[0]
            }
            onEdit={() => {
              setEditingEvidenceId(selectedEvidenceId);
              go('document');
            }}
          />
        );
      case 'share':
        return <Share back={back} />;
    }
  }, [
    screen,
    capturedEvidence, draftNote, draftLocation, saving, saveError,
    captureMode,
    selectedEvidenceId,
    collectionEvidence,
    editingEvidenceId,
    selectedMissionId,
    activeMissionId,
    activeRemix,
    missionDeck,
    missionDeckRevealed,
    missionDeckShuffleRound,
    completedMissionIds,
    trophyState,
    trophyCabinet,
    trophyEvaluations,
    lastUnlockedTrophyId,
    weeklyCase,
    weeklyCaseProgress,
  ]);

  if (storageError) return <View style={{ padding: 24 }}><AppText>{storageError}</AppText><Button label="Reload" onPress={() => window.location.reload()} /></View>;
  if (!aLoaded || !iLoaded || !storageReady) return <AppText>Loading saved discoveries…</AppText>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: 393,
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  screen: { flex: 1, backgroundColor: colors.white },

  topBar: {
    height: 64,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  hit: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMark: { width: 24, height: 24 },
  topTitle: { ...typography.h3, flex: 1, textAlign: 'center' },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  content16: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  content12: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  evidenceContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 14,
  },
  captureContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 16,
  },

  h1: { ...typography.h1 },
  h3: { ...typography.h3 },
  body: { ...typography.body, color: colors.text },
  label: { ...typography.label },
  smallMuted: { ...typography.small, color: colors.muted },
  meta: { ...typography.tiny, color: colors.muted },

  primaryButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: { ...typography.button, color: colors.white },
  outlineButton: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outlineButtonText: { ...typography.button, color: colors.blue },

  stepper: {
    height: 52,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  stepItem: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  stepCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: { backgroundColor: colors.blue },
  stepDone: { backgroundColor: colors.limeSubtle },
  stepNum: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    lineHeight: 12,
    color: colors.muted,
  },
  stepLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
  },

  sectionHeading: { gap: 2 },
  evidenceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  savedEvidenceCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 238,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 12,
    gap: 6,
  },
  savedEvidenceVisual: {
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  savedEvidenceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedEvidenceTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  savedEvidenceMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    lineHeight: 12,
    color: colors.blue,
  },
  savedEvidenceNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.text,
  },

  bottomNav: {
    height: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navItem: {
    width: 104,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navItemActive: { backgroundColor: colors.blueSubtle },
  navMark: { width: 24, height: 24 },
  navLabel: { ...typography.tiny, color: colors.muted },

  search: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  filter: {
    height: 44,
    width: 140,
    borderWidth: 1,
    borderColor: colors.lime,
    borderRadius: radius.full,
    backgroundColor: colors.limeSubtle,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  limeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },

  missionCard: {
    height: 176,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
    position: 'relative',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.blueSubtle,
  },
  pillText: { ...typography.tiny, color: colors.blue },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { width: 24, height: 6, backgroundColor: colors.blue },
  missionNumber: {
    position: 'absolute',
    right: 17,
    top: 13,
    width: 68,
    height: 48,
  },
  cornerTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 3,
    backgroundColor: colors.blue,
  },
  cornerLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 3,
    height: 28,
    backgroundColor: colors.blue,
  },
  numberText: {
    position: 'absolute',
    left: 8,
    top: 10,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    color: colors.blue,
  },
  numberDot: {
    position: 'absolute',
    right: 8,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },

  clue: {
    height: 164,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    backgroundColor: colors.blueSubtle,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
    position: 'relative',
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
  eyebrowBlue: { ...typography.tiny, color: colors.blue, letterSpacing: 0.88 },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#4D576E',
  },
  clueQ: { ...typography.h3, lineHeight: 26 },
  clueDot: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },

  signal: { flexDirection: 'row', gap: 14 },
  signalRail: {
    width: 10,
    height: 76,
    borderLeftWidth: 3,
    borderColor: colors.blue,
    position: 'relative',
  },
  signalDot: {
    position: 'absolute',
    left: -6,
    top: 20,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
  questionCard: {
    height: 92,
    borderWidth: 1,
    borderColor: '#CCD9F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    position: 'relative',
  },
  questionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
  },
  smallLimeDot: {
    position: 'absolute',
    right: 14,
    top: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  guidance: {
    height: 76,
    backgroundColor: colors.soft,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  guidanceTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  guidanceBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#666E82',
  },

  evidencePreview: {
    height: 260,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceCorner: { width: 132, height: 132, position: 'relative' },
  evTop: {
    position: 'absolute',
    width: 88,
    height: 14,
    top: 26,
    left: 22,
    backgroundColor: '#C8D4FF',
  },
  evLeft: {
    position: 'absolute',
    width: 14,
    height: 88,
    top: 26,
    left: 22,
    backgroundColor: '#C8D4FF',
  },
  evDot: {
    position: 'absolute',
    right: 20,
    top: 54,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F6C8',
  },
  captureRow: { flexDirection: 'row', gap: 8 },
  captureAction: {
    flex: 1,
    height: 96,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: radius.lg,
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

  sharedPreviewMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedPreviewPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34353C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  captureTitleBlock: {
    gap: 24,
  },
  captureTitle: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  cameraLargePanel: {
    height: 342,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    backgroundColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  audioLargePanel: {
    height: 342,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    overflow: 'hidden',
  },
  recordingBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#111318',
  },
  photoModeBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#111318',
  },
  photoModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  cameraBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.white,
  },
  captureStatus: {
    ...typography.label,
    color: colors.text,
    textAlign: 'center',
  },
  audioWaveform: {
    height: 48,
    width: 281,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  audioTimer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  photoControls: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  photoControlItem: {
    width: 72,
    alignItems: 'center',
    gap: 6,
  },
  photoSideButton: {
    width: 72,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.blue,
  },
  photoControlLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 7,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
  },
  reviewPanel: {
    height: 342,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    backgroundColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mediaTypeBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#111318',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34363D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wave: {
    height: 44,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },

  field: { gap: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.ink,
  },
  helper: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
  info: {
    minHeight: 72,
    backgroundColor: colors.blueBanner,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  success: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyCard: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#D7E7A7',
    borderRadius: radius.lg,
    backgroundColor: colors.limeSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  response: {
    minHeight: 96,
    backgroundColor: colors.softGrey,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  detail: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    gap: 22,
  },
  detailTitle: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  audioDetail: {
    height: 156,
    borderRadius: radius.lg,
    backgroundColor: colors.softGrey,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finding: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
  report: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: '#D4D9CB',
    backgroundColor: '#FBFCF8',
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  evidenceCard: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    alignItems: 'center',
  },
  thumb: { width: 88, height: 88 },
  avatar: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pref: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPill: {
    borderRadius: 999,
    backgroundColor: '#E8F6C8',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  evidenceDetailVisual: {
    height: 240,
    backgroundColor: colors.blueSubtle,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCard: {
    minHeight: 260,
    backgroundColor: colors.blueSubtle,
    borderRadius: radius.lg,
    padding: 20,
    gap: 18,
  },
  shareBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shareOption: {
    width: '48%',
    height: 92,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  logoLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: { width: 34, height: 34 },
  logoName: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.6,
  },
  logoTag: {
    ...typography.tiny,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.muted,
  },
  onboarding: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  footer: {
    ...typography.tiny,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 14,
  },
});
