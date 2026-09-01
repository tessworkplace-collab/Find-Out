import React, { useMemo, useState } from 'react';
import {
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
import { activeMission, nextMission, otherDiscoveries, yourDiscovery } from './src/data';
import { BRAND_MARK_URI } from './src/brand';
import { colors, radius, typography } from './src/theme';
import {
  ProductCollectionScreen,
  ProductCompleteScreen,
  ProductDiscoverScreen,
  ProductDocumentScreen,
  ProductEvidencePickerScreen,
  ProductInvestigateScreen,
  ProductMissionDetailScreen,
  ProductOnboardingScreen,
  ProductProfileScreen,
} from './src/components/FigmaProductScreens';

type Screen =
  | 'onboarding'
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
      onHowItWorks={() => go('discover')}
    />
  );
}

function Discover({ go }: { go: (s: Screen) => void }) {
  return (
    <ProductDiscoverScreen
      onOpenFeatured={() => go('mission-detail')}
      onOpenMission={() => go('mission-detail')}
      onCollection={() => go('my-discoveries')}
      onProfile={() => go('profile')}
    />
  );
}

function MissionDetail({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  return (
    <ProductMissionDetailScreen
      number={activeMission.number}
      difficulty="MEDIUM"
      evidence="Photo"
      title={activeMission.title}
      summary={activeMission.summary}
      question={activeMission.question}
      guidance={activeMission.guidance}
      onBack={back}
      onOpen={() => go('investigate')}
    />
  );
}

function Investigate({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  return (
    <ProductInvestigateScreen
      question={activeMission.question}
      onBack={back}
      onExit={() => go('discover')}
      onFound={() => go('evidence')}
    />
  );
}

function Evidence({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  return (
    <ProductEvidencePickerScreen
      onBack={back}
      onExit={() => go('discover')}
      onSelect={(mode) => goCapture(go, mode)}
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
}: {
  mode: CaptureMode;
  go: (s: Screen) => void;
  back: () => void;
}) {
  const label =
    mode === 'photo' ? 'PHOTO' : mode === 'video' ? 'VIDEO · 00:12' : 'AUDIO · 00:18';

  const icon =
    mode === 'photo'
      ? 'camera-outline'
      : mode === 'video'
        ? 'play'
        : 'play';

  return (
    <Frame>
      <TopBar title="Review evidence" onBack={back} />
      <ScrollView contentContainerStyle={styles.captureContent}>
        <View style={styles.captureTitleBlock}>
          <AppText style={styles.captureTitle}>Check your evidence</AppText>
          <AppText style={styles.body}>
            Make sure it clearly shows what you discovered.
          </AppText>
        </View>

        <View style={styles.reviewPanel}>
          <View style={styles.mediaTypeBadge}>
            <AppText style={styles.cameraBadgeText}>{label}</AppText>
          </View>

          {mode === 'photo' ? (
            <Ionicons name={icon} size={64} color={colors.white} />
          ) : (
            <View style={styles.playButton}>
              <Ionicons name="play" size={34} color={colors.white} />
            </View>
          )}
        </View>

        <AppText style={styles.captureStatus}>Ready to use</AppText>
        <Button label="Use this evidence" onPress={() => go('document')} />
        <Button outline label="Retake" onPress={() => go('capture')} />
      </ScrollView>
    </Frame>
  );
}

function Document({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  const [obs, setObs] = useState(yourDiscovery.observation);
  const [loc, setLoc] = useState('');

  return (
    <ProductDocumentScreen
      observation={obs}
      location={loc}
      onChangeObservation={setObs}
      onChangeLocation={setLoc}
      onBack={back}
      onSubmit={() => go('mission-complete')}
    />
  );
}

function MissionComplete({ go }: { go: (s: Screen) => void }) {
  return (
    <ProductCompleteScreen
      onClose={() => go('discover')}
      onOtherDiscoveries={() => go('other-discoveries')}
      onExplore={() => go('discover')}
    />
  );
}

function OtherDiscoveries({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  return (
    <Frame>
      <TopBar title="Other discoveries" onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <TitleBlock
          title="See what others found"
          body="See how others responded to the same mission."
        />
        <AppText style={styles.eyebrow}>A SOUND YOU KNOW</AppText>
        <AppText style={styles.body}>
          Notice a familiar sound you hear often but rarely pay attention to.
        </AppText>

        <View style={[styles.response, { backgroundColor: colors.limeSubtle }]}>
          <AppText style={styles.eyebrow}>YOUR DISCOVERY</AppText>
          <AppText style={styles.h3}>{yourDiscovery.title}</AppText>
          <AppText style={styles.smallMuted}>{yourDiscovery.note}</AppText>
        </View>

        <AppText style={styles.eyebrow}>WHAT OTHERS FOUND</AppText>
        {otherDiscoveries.map((d, i) => (
          <Pressable
            key={d.id}
            onPress={() => i === 0 && go('discovery-detail')}
            style={styles.response}
          >
            <AppText style={styles.meta}>{d.index}</AppText>
            <AppText style={styles.h3}>{d.title}</AppText>
            <AppText style={styles.smallMuted}>{d.location}</AppText>
          </Pressable>
        ))}

        <AppText style={styles.smallMuted}>
          Unlocked after your submission — other responses were hidden while you explored.
        </AppText>

        <Button
          outline
          label="Explore another mission"
          onPress={() => go('discover')}
        />
      </ScrollView>
    </Frame>
  );
}

function DiscoveryDetail({ back }: { back: () => void }) {
  const d = otherDiscoveries[0];

  return (
    <Frame>
      <TopBar title="Other discovery" onBack={back} />
      <ScrollView contentContainerStyle={styles.detail}>
        <AppText style={styles.eyebrow}>A SOUND YOU KNOW  ·  SAME MISSION</AppText>
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

function MyDiscoveries({ go }: { go: (s: Screen) => void }) {
  return (
    <ProductCollectionScreen
      activeMissionTitle={activeMission.title}
      onContinue={() => go('investigate')}
      onEvidence={() => go('evidence-detail')}
      onDiscover={() => go('discover')}
      onProfile={() => go('profile')}
    />
  );
}

function Profile({ go }: { go: (s: Screen) => void }) {
  return (
    <ProductProfileScreen
      onDiscover={() => go('discover')}
      onCollection={() => go('my-discoveries')}
      onTrophies={() => go('trophies')}
    />
  );
}

function Trophies({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  const trophies = [
    ['Sharp Observer', 'Document three field discoveries.', 'Unlocked'],
    ['Evidence Keeper', 'Capture a photo, video, and sound.', 'Unlocked'],
    ['Pattern Finder', 'Complete four investigation missions.', '3 / 4'],
    ['Night Scout', 'Finish a discovery after sunset.', 'Locked'],
  ];

  return (
    <Frame nav={<BottomNav active="profile" go={go} />}>
      <TopBar title="Trophies" onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.eyebrowBlue}>ACHIEVEMENT FIELD LOG</AppText>
        <AppText style={styles.body}>
          2 of 6 unlocked · keep following the clues.
        </AppText>

        {trophies.map(([title, description, progress], index) => (
          <View
            key={title}
            style={[
              styles.trophyCard,
              index === 2 && {
                backgroundColor: colors.blueSubtle,
                borderColor: '#D8E0FF',
              },
              index === 3 && {
                backgroundColor: colors.white,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            <Ionicons
              name="trophy-outline"
              size={30}
              color={index === 3 ? colors.muted : colors.blue}
            />
            <View style={{ flex: 1 }}>
              <AppText style={styles.h3}>{title}</AppText>
              <AppText style={styles.smallMuted}>{description}</AppText>
            </View>
            <View style={styles.progressPill}>
              <AppText style={styles.meta}>{progress}</AppText>
            </View>
          </View>
        ))}
      </ScrollView>
    </Frame>
  );
}

function EvidenceDetail({
  go,
  back,
}: {
  go: (s: Screen) => void;
  back: () => void;
}) {
  return (
    <Frame>
      <TopBar title="Evidence detail" onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pill}>
          <AppText style={styles.pillText}>SAVED</AppText>
        </View>

        <TitleBlock title="The place has changed" body="TODAY" />

        <View style={styles.evidenceDetailVisual}>
          <Image source={brandMark} style={{ width: 92, height: 92 }} />
        </View>

        <AppText style={styles.label}>Observation</AppText>
        <AppText style={styles.body}>
          The business shown on the inactive page is gone; a different shop now occupies the address.
        </AppText>

        <Button outline label="Edit note" onPress={() => go('document')} />
        <Button outline label="Share discovery" onPress={() => go('share')} />
      </ScrollView>
    </Frame>
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
  const [captureMode, setCaptureMode] = useState<CaptureMode>('audio');

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

  const content = useMemo(() => {
    switch (screen) {
      case 'onboarding':
        return <Onboarding go={go} />;
      case 'discover':
        return <Discover go={go} />;
      case 'mission-detail':
        return <MissionDetail go={go} back={back} />;
      case 'investigate':
        return <Investigate go={go} back={back} />;
      case 'evidence':
        return <Evidence go={go} back={back} />;
      case 'capture':
        return <Capture mode={captureMode} go={go} back={back} />;
      case 'evidence-preview':
        return <EvidencePreview mode={captureMode} go={go} back={back} />;
      case 'document':
        return <Document go={go} back={back} />;
      case 'mission-complete':
        return <MissionComplete go={go} />;
      case 'other-discoveries':
        return <OtherDiscoveries go={go} back={back} />;
      case 'discovery-detail':
        return <DiscoveryDetail back={back} />;
      case 'my-discoveries':
        return <MyDiscoveries go={go} />;
      case 'profile':
        return <Profile go={go} />;
      case 'trophies':
        return <Trophies go={go} back={back} />;
      case 'evidence-detail':
        return <EvidenceDetail go={go} back={back} />;
      case 'share':
        return <Share back={back} />;
    }
  }, [screen, captureMode]);

  if (!aLoaded || !iLoaded) return null;

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
