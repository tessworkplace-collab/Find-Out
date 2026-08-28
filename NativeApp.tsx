import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
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
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  Archivo_600SemiBold,
  useFonts as useArchivoFonts,
} from '@expo-google-fonts/archivo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { activeMission, missions, Mission } from './src/data';
import {
  clearDraft,
  loadDraft,
  persistEvidenceFile,
  removePersistedEvidence,
  saveDraft,
} from './src/draftStorage';
import {
  addCompletedDiscovery,
  approveCompletedDiscovery,
  attachUnlockedTrophies,
  CompletedDiscovery,
  loadCompletedDiscoveries,
  updateCompletedDiscovery,
} from './src/discoveryStorage';
import {
  equipTitle,
  loadProgression,
  ProgressionState,
  trophyById,
  trophyDefinitions,
  TrophyId,
  unlockEligibleTrophies,
} from './src/progressionStorage';
import { colors, radius, typography } from './src/theme';

type Screen =
  | 'discover'
  | 'mission'
  | 'investigate'
  | 'evidence'
  | 'capture'
  | 'preview'
  | 'document'
  | 'complete'
  | 'discoveries'
  | 'discovery-detail'
  | 'edit-discovery'
  | 'profile'
  | 'trophies';

type CaptureMode = 'photo' | 'video' | 'audio';
type MissionFilter = 'ALL' | Mission['difficulty'];

type Evidence = {
  type: CaptureMode;
  uri: string;
  durationMs?: number;
};

const DEFAULT_OBSERVATION = '';
const AUDIO_MAX_DURATION_MS = 10_000;
const MISSION_OFFER_COUNT = 6;
const captureChoices = [
  ['photo', 'camera-outline', 'Photo'],
  ['video', 'videocam-outline', 'Video'],
  ['audio', 'mic-outline', 'Audio'],
] as const;

function createMissionOffers(excludeMissionId?: string) {
  const pool = missions.filter(mission => mission.id !== excludeMissionId);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, MISSION_OFFER_COUNT);
}

function missionNumberFor(missionId: string) {
  return missions.find(mission => mission.id === missionId)?.number ?? '--';
}

function AppText({ children, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
}

function MissionNumberMark({ number }: { number: string }) {
  return (
    <View style={styles.missionNumberMark}>
      <View style={styles.missionNumberRule} />
      <View style={styles.missionNumberCopy}>
        <AppText style={styles.missionNumberWord}>MISSION</AppText>
        <AppText style={styles.missionNumberDigits}>{number}</AppText>
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  outline = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        outline ? styles.outlineButton : styles.primaryButton,
        disabled && { opacity: 0.45 },
        pressed && !disabled && { opacity: 0.82 },
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
  onBack,
  onExit,
}: {
  title: string;
  onBack?: () => void;
  onExit?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable style={styles.hit} onPress={onBack} disabled={!onBack}>
        {onBack ? <Ionicons name="chevron-back" size={24} color={colors.ink} /> : null}
      </Pressable>
      <AppText style={styles.topTitle}>{title}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Exit mission to Home"
        style={styles.hit}
        onPress={onExit}
        disabled={!onExit}
      >
        {onExit ? <Ionicons name="close" size={24} color={colors.ink} /> : null}
      </Pressable>
    </View>
  );
}

function Stepper({
  active,
  maxStep,
  onStepPress,
  disabled = false,
}: {
  active: number;
  maxStep: number;
  onStepPress: (index: number) => void;
  disabled?: boolean;
}) {
  const labels = ['Notice', 'Investigate', 'Document', 'Submit'];

  return (
    <View style={styles.stepper}>
      {labels.map((label, index) => {
        const available = index <= maxStep && !disabled;
        const isActive = index === active;
        const isUnlocked = index <= maxStep;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Step ${index + 1}: ${label}`}
            disabled={!available}
            key={label}
            onPress={() => onStepPress(index)}
            style={({ pressed }) => [
              styles.stepItem,
              !isUnlocked && styles.stepItemDisabled,
              pressed && available && { opacity: 0.65 },
            ]}
          >
            <View
              style={[
                styles.stepDot,
                isUnlocked && !isActive && styles.stepDotUnlocked,
                isActive && styles.stepDotActive,
              ]}
            >
              <AppText
                style={[
                  styles.stepNumber,
                  isActive && { color: colors.white },
                  isUnlocked && !isActive && { color: colors.text },
                ]}
              >
                {index + 1}
              </AppText>
            </View>
            <AppText
              style={[
                styles.stepLabel,
                isUnlocked && !isActive && styles.stepLabelUnlocked,
                isActive && { color: colors.blue },
              ]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function PermissionGate({
  title,
  body,
  canAskAgain = true,
  onRequest,
}: {
  title: string;
  body: string;
  canAskAgain?: boolean;
  onRequest: () => void;
}) {
  return (
    <View style={styles.permissionWrap}>
      <View style={styles.permissionIcon}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.blue} />
      </View>
      <AppText style={styles.h1}>{title}</AppText>
      <AppText style={styles.body}>{body}</AppText>
      <PrimaryButton
        label={canAskAgain ? 'Allow access' : 'Open settings'}
        onPress={canAskAgain ? onRequest : () => Linking.openSettings()}
      />
    </View>
  );
}

function formatDuration(ms = 0) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function VideoEvidencePreview({ uri, durationMs = 0 }: { uri: string; durationMs?: number }) {
  const player = useVideoPlayer(uri, videoPlayer => {
    videoPlayer.loop = false;
  });

  return (
    <View style={styles.mediaReviewWrap}>
      <VideoView
        player={player}
        style={styles.previewVideo}
        nativeControls
        contentFit="contain"
      />
      <View style={styles.mediaMetaRow}>
        <Ionicons name="videocam-outline" size={18} color={colors.blue} />
        <AppText style={styles.mediaMeta}>Video · {formatDuration(durationMs)}</AppText>
      </View>
    </View>
  );
}

function AudioEvidencePreview({ uri, durationMs = 0 }: { uri: string; durationMs?: number }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const currentMs = Math.round((status.currentTime ?? 0) * 1000);
  const loadedDurationMs = Math.round((status.duration ?? 0) * 1000);
  const totalMs = loadedDurationMs > 0 ? loadedDurationMs : durationMs;

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }

    if (totalMs > 0 && currentMs >= totalMs - 250) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.audioReviewCard}>
      <View style={styles.audioReviewIcon}>
        <Ionicons name="mic-outline" size={34} color={colors.blue} />
      </View>
      <View style={styles.waveform}>
        {[18, 34, 24, 48, 30, 42, 20, 36, 26, 44, 22].map((height, index) => (
          <View key={index} style={[styles.waveBar, { height }]} />
        ))}
      </View>
      <AppText style={styles.timer}>
        {formatDuration(currentMs)} / {formatDuration(totalMs)}
      </AppText>
      <Pressable onPress={togglePlayback} style={styles.playButton}>
        <Ionicons
          name={status.playing ? 'pause' : 'play'}
          size={24}
          color={colors.white}
        />
        <AppText style={styles.playButtonText}>{status.playing ? 'Pause' : 'Play recording'}</AppText>
      </Pressable>
    </View>
  );
}

export default function NativeApp() {
  const [archivoLoaded] = useArchivoFonts({ Archivo_600SemiBold });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });
  const [screen, setScreen] = useState<Screen>('discover');
  const [selectedMission, setSelectedMission] = useState<Mission>(activeMission);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoDurationMs, setVideoDurationMs] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [observation, setObservation] = useState(DEFAULT_OBSERVATION);
  const [location, setLocation] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const [captureOptionsVisible, setCaptureOptionsVisible] = useState(false);
  const [discoveries, setDiscoveries] = useState<CompletedDiscovery[]>([]);
  const [submittingDiscovery, setSubmittingDiscovery] = useState(false);
  const [missionFilter, setMissionFilter] = useState<MissionFilter>('ALL');
  const [missionOffers, setMissionOffers] = useState<Mission[]>(() => createMissionOffers());
  const [selectedDiscovery, setSelectedDiscovery] = useState<CompletedDiscovery | null>(null);
  const [editObservation, setEditObservation] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [progression, setProgression] = useState<ProgressionState>({ unlockedTrophies: [], equippedTitleId: null });
  const [newlyUnlockedTrophyIds, setNewlyUnlockedTrophyIds] = useState<TrophyId[]>([]);

  const cameraRef = useRef<CameraView | null>(null);
  const videoStartedAt = useRef<number | null>(null);
  const audioAutoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioStopInProgress = useRef(false);
  const suppressDiscoverAutosave = useRef(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [videoMicPermission, requestVideoMicPermission] = useMicrophonePermissions();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioState = useAudioRecorderState(audioRecorder, 200);

  useEffect(() => {
    let mounted = true;

    const restoreDraft = async () => {
      try {
        const draft = await loadDraft();
        if (!mounted || !draft) return;

        const restoredEvidence = draft.evidence as Evidence | null;
        const restoredScreen: Screen =
          draft.screen === 'capture' ||
          draft.screen === 'preview' ||
          draft.screen === 'evidence'
            ? restoredEvidence
              ? 'document'
              : 'investigate'
            : draft.screen === 'complete' && !draft.submitted
              ? 'document'
              : (draft.screen as Screen);

        const restoredMission = draft.missionId
          ? missions.find(mission => mission.id === draft.missionId)
          : undefined;
        if (restoredMission) setSelectedMission(restoredMission);

        setCaptureMode(draft.captureMode);
        setEvidence(restoredEvidence);
        setHighestStep(draft.highestStep);
        setSubmitted(draft.submitted);
        setObservation(draft.observation || DEFAULT_OBSERVATION);
        setLocation(draft.location || '');
        setScreen(restoredScreen);
      } catch {
        // A broken local draft should never block the prototype from opening.
      } finally {
        if (mounted) setDraftReady(true);
      }
    };

    restoreDraft();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;

    if (screen === 'discover' && suppressDiscoverAutosave.current) {
      suppressDiscoverAutosave.current = false;
      return;
    }

    const hasProgress =
      screen !== 'discover' ||
      highestStep > 0 ||
      Boolean(evidence) ||
      location.length > 0 ||
      observation !== DEFAULT_OBSERVATION;

    if (!hasProgress) return;

    const restorableScreen =
      screen === 'capture' || screen === 'preview'
        ? evidence
          ? 'document'
          : 'investigate'
        : screen;

    const timer = setTimeout(() => {
      saveDraft({
        missionId: selectedMission.id,
        screen: restorableScreen,
        captureMode,
        evidence,
        highestStep,
        submitted,
        observation,
        location,
      }).catch(() => undefined);
    }, 250);

    return () => clearTimeout(timer);
  }, [
    draftReady,
    screen,
    captureMode,
    evidence,
    highestStep,
    submitted,
    observation,
    location,
    selectedMission.id,
  ]);

  useEffect(() => {
    loadProgression().then(setProgression).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isVideoRecording) return;

    const timer = setInterval(() => {
      if (videoStartedAt.current) {
        setVideoDurationMs(Date.now() - videoStartedAt.current);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [isVideoRecording]);

  if (!archivoLoaded || !interLoaded || !draftReady) return null;

  const updateHighestStep = (step: number) => {
    setHighestStep(current => Math.max(current, step));
  };

  const getRestorableScreen = (): Screen => {
    if (screen === 'capture' || screen === 'preview') {
      return evidence ? 'document' : 'investigate';
    }
    return screen;
  };

  const exitMissionToHome = async () => {
    if (isVideoRecording || audioState.isRecording) return;

    suppressDiscoverAutosave.current = true;
    try {
      await saveDraft({
        missionId: selectedMission.id,
        screen: getRestorableScreen(),
        captureMode,
        evidence,
        highestStep,
        submitted,
        observation,
        location,
      });
    } catch {
      // The existing autosave/file fallback still protects most drafts.
    }
    setScreen('discover');
  };

  const goToStep = (index: number) => {
    if (index > highestStep || isVideoRecording || audioState.isRecording) return;

    if (index === 0) {
      setScreen('mission');
      return;
    }
    if (index === 1) {
      setScreen('investigate');
      return;
    }
    if (index === 2) {
      setScreen(evidence ? 'document' : 'investigate');
      return;
    }
    if (index === 3 && submitted) {
      setScreen('complete');
    }
  };

  const goCapture = (mode: CaptureMode) => {
    if (!selectedMission.acceptedEvidence.includes(mode)) return;
    setCaptureMode(mode);
    setCameraReady(false);
    setVideoDurationMs(0);
    setScreen('capture');
  };

  const commitEvidence = async (nextEvidence: Evidence) => {
    let stableEvidence = nextEvidence;

    try {
      stableEvidence = (await persistEvidenceFile(nextEvidence)) as Evidence;
      if (evidence?.uri && evidence.uri !== stableEvidence.uri) {
        await removePersistedEvidence(evidence);
      }
    } catch {
      // Keep the live URI so the user can still finish this session.
    }

    setEvidence(stableEvidence);
    updateHighestStep(2);
    return stableEvidence;
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!result?.uri) return;
      await commitEvidence({ type: 'photo', uri: result.uri });
      setScreen('preview');
    } catch (error) {
      Alert.alert(
        'Camera error',
        error instanceof Error ? error.message : 'Could not take photo.',
      );
    }
  };

  const pickPhotoFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Allow photo library access so you can choose an existing image as evidence.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      setCaptureMode('photo');
      await commitEvidence({ type: 'photo', uri: result.assets[0].uri });
      setScreen('preview');
    } catch (error) {
      Alert.alert(
        'Photo library error',
        error instanceof Error ? error.message : 'Could not open your photo library.',
      );
    }
  };

  const toggleVideo = async () => {
    if (!cameraRef.current || !cameraReady) return;

    if (isVideoRecording) {
      cameraRef.current.stopRecording();
      return;
    }

    try {
      videoStartedAt.current = Date.now();
      setVideoDurationMs(0);
      setIsVideoRecording(true);
      const result = await cameraRef.current.recordAsync({ maxDuration: 5 });
      const durationMs = videoStartedAt.current
        ? Date.now() - videoStartedAt.current
        : videoDurationMs;

      if (result?.uri) {
        setVideoDurationMs(durationMs);
        await commitEvidence({ type: 'video', uri: result.uri, durationMs });
        setScreen('preview');
      }
    } catch (error) {
      Alert.alert(
        'Video error',
        error instanceof Error ? error.message : 'Could not record video.',
      );
    } finally {
      videoStartedAt.current = null;
      setIsVideoRecording(false);
    }
  };

  const stopAudioRecording = async (durationOverride?: number) => {
    if (audioStopInProgress.current) return;
    audioStopInProgress.current = true;

    if (audioAutoStopTimer.current) {
      clearTimeout(audioAutoStopTimer.current);
      audioAutoStopTimer.current = null;
    }

    try {
      await audioRecorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const uri = audioRecorder.uri ?? audioState.url;
      if (uri) {
        await commitEvidence({
          type: 'audio',
          uri,
          durationMs: durationOverride ?? audioState.durationMillis,
        });
        setScreen('preview');
      }
    } finally {
      audioStopInProgress.current = false;
    }
  };

  const toggleAudio = async () => {
    try {
      if (audioState.isRecording) {
        await stopAudioRecording();
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Microphone access needed',
          'Allow microphone access to record audio evidence.',
        );
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioStopInProgress.current = false;
      audioRecorder.record();
      audioAutoStopTimer.current = setTimeout(() => {
        void stopAudioRecording(AUDIO_MAX_DURATION_MS).catch(error => {
          Alert.alert(
            'Audio error',
            error instanceof Error ? error.message : 'Could not finish audio recording.',
          );
        });
      }, AUDIO_MAX_DURATION_MS);
    } catch (error) {
      Alert.alert(
        'Audio error',
        error instanceof Error ? error.message : 'Could not record audio.',
      );
    }
  };

  const resetMission = async () => {
    try { await clearDraft(evidence); } catch {}
    const nextOffers = createMissionOffers(selectedMission.id);
    setMissionOffers(nextOffers);
    setSelectedMission(nextOffers[0] ?? activeMission);
    setEvidence(null);
    setSubmitted(false);
    setHighestStep(0);
    setObservation(DEFAULT_OBSERVATION);
    setLocation('');
    setCaptureMode((nextOffers[0] ?? activeMission).acceptedEvidence[0] ?? 'photo');
    setCaptureOptionsVisible(false);
    setNewlyUnlockedTrophyIds([]);
    setScreen('discover');
  };

  const startMission = async (mission: Mission) => {
    try { await clearDraft(evidence); } catch {}
    setSelectedMission(mission);
    setEvidence(null);
    setSubmitted(false);
    setHighestStep(0);
    setObservation(DEFAULT_OBSERVATION);
    setLocation('');
    setCaptureMode(mission.acceptedEvidence[0] ?? 'photo');
    setCaptureOptionsVisible(false);
    setNewlyUnlockedTrophyIds([]);
    setScreen('mission');
  };

  const openMissionForTest = (mission: Mission) => {
    const hasProgress = selectedMission.id !== mission.id && !submitted &&
      (highestStep > 0 || Boolean(evidence) || observation.length > 0 || location.length > 0);
    if (hasProgress) {
      Alert.alert('Abandon current mission?', 'Your current draft will be removed if you start another mission.', [
        { text: 'Keep current mission', style: 'cancel' },
        { text: 'Abandon & start new', style: 'destructive', onPress: () => void startMission(mission) },
      ]);
      return;
    }
    void startMission(mission);
  };

  const openMyDiscoveries = async () => {
    const saved = await loadCompletedDiscoveries();
    setDiscoveries(saved);
    setScreen('discoveries');
  };

  const openDiscoveryDetail = (item: CompletedDiscovery) => {
    setSelectedDiscovery(item);
    setScreen('discovery-detail');
  };

  const beginEditDiscovery = (item: CompletedDiscovery) => {
    setSelectedDiscovery(item);
    setEditObservation(item.observation);
    setEditLocation(item.location);
    setScreen('edit-discovery');
  };

  const resubmitDiscoveryChanges = async () => {
    if (!selectedDiscovery) return;
    try {
      const updated = await updateCompletedDiscovery(selectedDiscovery.id, {
        observation: editObservation,
        location: editLocation,
      });
      setSelectedDiscovery(updated);
      setDiscoveries(current => current.map(item => (item.id === updated.id ? updated : item)));
      setScreen('discovery-detail');
    } catch (error) {
      Alert.alert(
        'Could not resubmit changes',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const simulateApproval = async () => {
    if (!selectedDiscovery) return;
    try {
      const updated = await approveCompletedDiscovery(selectedDiscovery.id);
      setSelectedDiscovery(updated);
      setDiscoveries(current => current.map(item => (item.id === updated.id ? updated : item)));
    } catch (error) {
      Alert.alert(
        'Could not update review',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const openProfile = async () => {
    const [savedDiscoveries, savedProgression] = await Promise.all([
      loadCompletedDiscoveries(),
      loadProgression(),
    ]);
    setDiscoveries(savedDiscoveries);
    setProgression(savedProgression);
    setScreen('profile');
  };

  const toggleEquippedTitle = async (id: TrophyId) => {
    try {
      const next = await equipTitle(progression.equippedTitleId === id ? null : id);
      setProgression(next);
    } catch (error) {
      Alert.alert('Could not equip title', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const submitDiscovery = async () => {
    if (!evidence || submittingDiscovery) return;
    setSubmittingDiscovery(true);
    try {
      const completed = await addCompletedDiscovery({
        missionId: selectedMission.id,
        missionTitle: selectedMission.title,
        difficulty: selectedMission.difficulty,
        observation,
        location,
        evidence,
      });
      const saved = await loadCompletedDiscoveries();
      const unlockResult = await unlockEligibleTrophies(saved);
      const unlockedIds = unlockResult.newlyUnlocked.map(item => item.id);
      if (unlockedIds.length > 0) await attachUnlockedTrophies(completed.id, unlockedIds);
      setDiscoveries(await loadCompletedDiscoveries());
      setProgression(unlockResult.state);
      setNewlyUnlockedTrophyIds(unlockedIds);
      setSubmitted(true);
      updateHighestStep(3);
      setScreen('complete');
    } catch (error) {
      Alert.alert('Could not save discovery', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmittingDiscovery(false);
    }
  };

  const featuredMission = missionOffers[0] ?? activeMission;
  const filteredTestMissions = missionOffers
    .filter(mission => missionFilter === 'ALL' || mission.difficulty === missionFilter)
    .filter(mission => mission.id !== featuredMission.id);

  const renderCapture = () => {
    const recording = isVideoRecording || audioState.isRecording;

    if (captureMode === 'audio') {
      return (
        <SafeAreaView style={styles.safe}>
          <TopBar
            title="Record audio"
            onBack={() => setScreen('investigate')}
            onExit={exitMissionToHome}
          />
          <ScrollView contentContainerStyle={styles.content}>
            <Stepper
              active={1}
              maxStep={highestStep}
              onStepPress={goToStep}
              disabled={recording}
            />
            <AppText style={styles.h1}>Capture the sound</AppText>
            <AppText style={styles.body}>Stay nearby and capture the sound clearly. Recording stops automatically at 10 seconds.</AppText>
            <View style={styles.audioPanel}>
              <Ionicons name="mic-outline" size={64} color={colors.blue} />
              <View style={styles.waveform}>
                {[18, 34, 24, 48, 30, 42, 20, 36, 26, 44, 22].map((height, index) => (
                  <View key={index} style={[styles.waveBar, { height }]} />
                ))}
              </View>
              <AppText style={styles.timer}>{formatDuration(audioState.durationMillis)}</AppText>
            </View>
            <AppText style={styles.centerMeta}>
              {audioState.isRecording ? 'Recording audio…' : 'Ready to record'}
            </AppText>
            <PrimaryButton
              label={audioState.isRecording ? 'Stop & preview' : 'Start recording'}
              onPress={toggleAudio}
            />
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (!cameraPermission) return <SafeAreaView style={styles.safe} />;

    if (!cameraPermission.granted) {
      return (
        <SafeAreaView style={styles.safe}>
          <TopBar
            title={captureMode === 'photo' ? 'Take photo' : 'Record video'}
            onBack={() => setScreen('investigate')}
            onExit={exitMissionToHome}
          />
          <PermissionGate
            title="Use your camera"
            body="Allow access to capture photo and video evidence. Nothing is shared until you choose."
            canAskAgain={cameraPermission.canAskAgain}
            onRequest={() => requestCameraPermission()}
          />
        </SafeAreaView>
      );
    }

    if (captureMode === 'video' && videoMicPermission && !videoMicPermission.granted) {
      return (
        <SafeAreaView style={styles.safe}>
          <TopBar
            title="Record video"
            onBack={() => setScreen('investigate')}
            onExit={exitMissionToHome}
          />
          <PermissionGate
            title="Use your microphone"
            body="Video evidence can include sound. Allow microphone access to record it."
            canAskAgain={videoMicPermission.canAskAgain}
            onRequest={() => requestVideoMicPermission()}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title={captureMode === 'photo' ? 'Take photo' : 'Record video'}
          onBack={() => setScreen('investigate')}
          onExit={recording ? undefined : exitMissionToHome}
        />
        <View style={styles.cameraScreen}>
          <Stepper
            active={1}
            maxStep={highestStep}
            onStepPress={goToStep}
            disabled={recording}
          />
          <View style={styles.captureHeading}>
            <AppText style={styles.h2}>
              {captureMode === 'photo' ? 'Frame your discovery' : 'Capture what you found'}
            </AppText>
            <AppText style={styles.body}>Keep the discovery clearly in frame.</AppText>
          </View>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode={captureMode === 'video' ? 'video' : 'picture'}
            mute={false}
            onCameraReady={() => setCameraReady(true)}
          >
            {captureMode === 'video' ? (
              <View style={styles.recordBadge}>
                <View style={styles.recordDot} />
                <AppText style={styles.recordText}>
                  {isVideoRecording ? `REC ${formatDuration(videoDurationMs)}` : 'READY 00:00'}
                </AppText>
              </View>
            ) : null}
          </CameraView>
          {captureMode === 'photo' ? (
            <View style={styles.photoControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose photo from library"
                style={({ pressed }) => [styles.sideControl, pressed && { opacity: 0.7 }]}
                onPress={pickPhotoFromLibrary}
              >
                <Ionicons name="images-outline" size={30} color={colors.blue} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take photo"
                onPress={takePhoto}
                disabled={!cameraReady}
                style={({ pressed }) => [
                  styles.shutterOuter,
                  !cameraReady && { opacity: 0.45 },
                  pressed && cameraReady && { opacity: 0.7 },
                ]}
              >
                <View style={styles.shutterInner} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Flip camera"
                style={styles.sideControl}
                onPress={() => setFacing(value => (value === 'back' ? 'front' : 'back'))}
              >
                <Ionicons name="camera-reverse-outline" size={30} color={colors.blue} />
              </Pressable>
            </View>
          ) : (
            <PrimaryButton
              label={isVideoRecording ? 'Stop & preview' : 'Start recording'}
              onPress={toggleVideo}
              disabled={!cameraReady}
            />
          )}
        </View>
      </SafeAreaView>
    );
  };

  if (screen === 'capture') return renderCapture();

  if (screen === 'preview' && evidence) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title="Review evidence"
          onBack={() => setScreen('capture')}
          onExit={exitMissionToHome}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={1} maxStep={highestStep} onStepPress={goToStep} />
          <AppText style={styles.h1}>Check your evidence</AppText>
          <AppText style={styles.body}>
            Play it back or review it before you continue to your field note.
          </AppText>

          {evidence.type === 'photo' ? (
            <View style={styles.previewPanel}>
              <Image source={{ uri: evidence.uri }} style={styles.previewImage} />
            </View>
          ) : evidence.type === 'video' ? (
            <VideoEvidencePreview uri={evidence.uri} durationMs={evidence.durationMs} />
          ) : (
            <AudioEvidencePreview uri={evidence.uri} durationMs={evidence.durationMs} />
          )}

          <AppText style={styles.centerMeta}>Saved locally on this device for this draft.</AppText>
          <PrimaryButton label="Use this evidence" onPress={() => setScreen('document')} />
          <PrimaryButton outline label="Retake" onPress={() => setScreen('capture')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'document') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title="Document"
          onBack={() => setScreen(evidence ? 'preview' : 'investigate')}
          onExit={exitMissionToHome}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={2} maxStep={highestStep} onStepPress={goToStep} />
          <AppText style={styles.eyebrow}>FIELD NOTE · MISSION {selectedMission.number}</AppText>
          <AppText style={styles.h1}>Describe what you found</AppText>
          <AppText style={styles.body}>
            Add just enough context for someone else to understand what you found.
          </AppText>
          <View style={styles.field}>
            <AppText style={styles.label}>Observation</AppText>
            <TextInput
              multiline
              value={observation}
              onChangeText={setObservation}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <AppText style={styles.label}>Location</AppText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Optional place name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          {evidence ? (
            <Pressable style={styles.linkedEvidence} onPress={() => setScreen('preview')}>
              <Ionicons name="play-circle-outline" size={28} color={colors.blue} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.label}>{evidence.type.toUpperCase()} evidence linked</AppText>
                <AppText style={styles.smallMuted}>
                  {evidence.type === 'photo'
                    ? 'Tap to review photo'
                    : `Tap to play again · ${formatDuration(evidence.durationMs)}`}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ) : null}

          <View style={styles.draftNote}>
            <Ionicons name="cloud-done-outline" size={18} color={colors.blue} />
            <AppText style={styles.smallMuted}>Draft saves automatically on this device.</AppText>
          </View>

          <PrimaryButton
            label={submittingDiscovery ? 'Saving discovery…' : 'Submit discovery'}
            disabled={!evidence || submittingDiscovery}
            onPress={submitDiscovery}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Mission complete" onExit={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={3} maxStep={highestStep} onStepPress={goToStep} />
          <View style={styles.completeWrap}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={34} color={colors.ink} />
            </View>
            <AppText style={styles.h1}>Discovery submitted</AppText>
            <AppText style={styles.body}>
              Your evidence has been saved and sent to the prototype review state.
            </AppText>
            <View style={styles.reviewStatusCard}>
              <Ionicons name="time-outline" size={22} color={colors.blue} />
              <View style={{ flex: 1, gap: 3 }}>
                <AppText style={styles.label}>PENDING REVIEW</AppText>
                <AppText style={styles.smallMuted}>Approval is simulated in this prototype from the field note detail.</AppText>
              </View>
            </View>
            {newlyUnlockedTrophyIds.length > 0 ? (
              <View style={styles.trophyUnlockWrap}>
                <AppText style={styles.eyebrow}>TROPHY UNLOCKED</AppText>
                {newlyUnlockedTrophyIds.map(id => {
                  const trophy = trophyById(id);
                  return trophy ? (
                    <View key={id} style={styles.trophyUnlockCard}>
                      <Ionicons name="trophy-outline" size={30} color={colors.blue} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <AppText style={styles.h3}>{trophy.title}</AppText>
                        <AppText style={styles.smallMuted}>{trophy.description}</AppText>
                      </View>
                    </View>
                  ) : null;
                })}
              </View>
            ) : null}
            {evidence ? (
              <PrimaryButton outline label="Review submitted evidence" onPress={() => setScreen('preview')} />
            ) : null}
            <PrimaryButton outline label="View My Discoveries" onPress={openMyDiscoveries} />
            <PrimaryButton label="Explore another mission" onPress={resetMission} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'discovery-detail' && selectedDiscovery) {
    const approved = selectedDiscovery.reviewStatus === 'approved';
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Field note" onBack={() => setScreen('discoveries')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>FIELD NOTE · MISSION {missionNumberFor(selectedDiscovery.missionId)} · {selectedDiscovery.difficulty}</AppText>
          <AppText style={styles.h1}>{selectedDiscovery.missionTitle}</AppText>

          <View style={styles.reviewStatusCard}>
            <Ionicons
              name={approved ? 'checkmark-circle-outline' : 'time-outline'}
              size={24}
              color={colors.blue}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText style={styles.label}>{approved ? 'APPROVED' : 'PENDING REVIEW'}</AppText>
              <AppText style={styles.smallMuted}>
                {approved
                  ? 'APPROVED DISCOVERY'
                  : 'DISCOVERY APPROVAL REQUIRED'}
              </AppText>
            </View>
          </View>

          {selectedDiscovery.evidence.type === 'photo' ? (
            <Image source={{ uri: selectedDiscovery.evidence.uri }} style={styles.detailEvidenceImage} />
          ) : (
            <View style={styles.detailEvidencePlaceholder}>
              <Ionicons
                name={selectedDiscovery.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                size={44}
                color={colors.blue}
              />
              <AppText style={styles.archiveLabel}>{selectedDiscovery.evidence.type.toUpperCase()} EVIDENCE</AppText>
            </View>
          )}

          <View style={styles.field}>
            <AppText style={styles.label}>Observation</AppText>
            <AppText style={styles.body}>{selectedDiscovery.observation || 'No observation added.'}</AppText>
          </View>
          <View style={styles.field}>
            <AppText style={styles.label}>Location</AppText>
            <AppText style={styles.body}>{selectedDiscovery.location || 'Location not added'}</AppText>
          </View>

          <PrimaryButton outline label="Edit field note" onPress={() => beginEditDiscovery(selectedDiscovery)} />
          {!approved ? (
            <PrimaryButton outline label="Prototype: approve discovery" onPress={simulateApproval} />
          ) : null}
          <AppText style={styles.centerMeta}>Prototype review only · no live moderator or backend is connected.</AppText>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'edit-discovery' && selectedDiscovery) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Edit field note" onBack={() => setScreen('discovery-detail')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>EDIT SUBMISSION</AppText>
          <AppText style={styles.h1}>Update what you found</AppText>
          <AppText style={styles.body}>
            {selectedDiscovery.reviewStatus === 'approved'
              ? 'Editing sends this discovery back to Pending Review.'
              : 'Your changes will be resubmitted for review.'}
          </AppText>
          <View style={styles.field}>
            <AppText style={styles.label}>Observation</AppText>
            <TextInput
              multiline
              value={editObservation}
              onChangeText={setEditObservation}
              placeholder="What did you notice?"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <AppText style={styles.label}>Location</AppText>
            <TextInput
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Optional place name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <PrimaryButton label="Resubmit changes" onPress={resubmitDiscoveryChanges} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'profile') {
    const equipped = progression.equippedTitleId ? trophyById(progression.equippedTitleId) : undefined;
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Profile" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={38} color={colors.blue} />
          </View>
          <AppText style={[styles.h1, { textAlign: 'center' }]}>Explorer profile</AppText>
          <AppText style={[styles.body, { textAlign: 'center' }]}>
            {discoveries.length} discoveries · {new Set(discoveries.map(item => item.missionId)).size} missions completed
          </AppText>
          <View style={styles.equippedTitleCard}>
            <AppText style={styles.eyebrow}>EQUIPPED TITLE</AppText>
            <AppText style={styles.h3}>{equipped?.title ?? 'No title equipped'}</AppText>
            <AppText style={styles.smallMuted}>
              {equipped ? 'Visible as your current profile title.' : 'Unlock a trophy, then choose a title to equip.'}
            </AppText>
          </View>
          <PrimaryButton label="View trophies & titles" onPress={() => setScreen('trophies')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'trophies') {
    const unlockedMap = new Map(progression.unlockedTrophies.map(item => [item.id, item]));
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Trophies & titles" onBack={() => setScreen('profile')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>ACHIEVEMENT FIELD LOG</AppText>
          <AppText style={styles.h1}>Trophies</AppText>
          <AppText style={styles.body}>
            {progression.unlockedTrophies.length} of {trophyDefinitions.length} unlocked. Trophies support completion; exploration stays central.
          </AppText>
          {progression.unlockedTrophies.length === 0 ? (
            <View style={styles.emptyJournalCard}>
              <Ionicons name="trophy-outline" size={30} color={colors.blue} />
              <AppText style={styles.h3}>No trophies unlocked yet</AppText>
              <AppText style={styles.body}>Complete missions and document what you find.</AppText>
            </View>
          ) : null}
          {trophyDefinitions.map(trophy => {
            const unlocked = unlockedMap.get(trophy.id);
            const hiddenLocked = trophy.hidden && !unlocked;
            const equipped = progression.equippedTitleId === trophy.id;
            return (
              <View key={trophy.id} style={[styles.trophyCardNative, !unlocked && styles.trophyCardLockedNative]}>
                <View style={styles.trophyIconNative}>
                  <Ionicons name={hiddenLocked ? 'help-outline' : 'trophy-outline'} size={30} color={unlocked ? colors.blue : colors.muted} />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <AppText style={styles.h3}>{hiddenLocked ? 'Hidden trophy' : trophy.title}</AppText>
                  <AppText style={styles.smallMuted}>
                    {hiddenLocked ? 'Keep exploring to reveal this trophy.' : trophy.description}
                  </AppText>
                  {unlocked ? (
                    <AppText style={styles.archiveLabel}>UNLOCKED {new Date(unlocked.unlockedAt).toLocaleDateString()}</AppText>
                  ) : (
                    <AppText style={styles.archiveLabel}>LOCKED</AppText>
                  )}
                </View>
                {unlocked ? (
                  <Pressable style={styles.equipPill} onPress={() => void toggleEquippedTitle(trophy.id)}>
                    <AppText style={styles.badgeText}>{equipped ? 'UNEQUIP' : 'EQUIP'}</AppText>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'discoveries') {
    const latestDiscovery = discoveries[0];
    const earlierDiscoveries = discoveries.slice(1);

    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="My Discoveries" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>MY DISCOVERIES</AppText>
          <AppText style={styles.h1}>What caught your attention.</AppText>
          <AppText style={styles.body}>A record of the things you chose to notice.</AppText>

          <View style={styles.archiveSummary}>
            <View>
              <AppText style={styles.archiveCount}>{discoveries.length.toString().padStart(2, '0')}</AppText>
              <AppText style={styles.archiveLabel}>
                {discoveries.length === 1 ? 'DISCOVERY' : 'DISCOVERIES'}
              </AppText>
            </View>
            <View style={styles.archiveSavedRow}>
              <View style={styles.archiveDot} />
              <AppText style={styles.smallMuted}>SAVED ON THIS DEVICE</AppText>
            </View>
          </View>

          {discoveries.length === 0 ? (
            <View style={styles.emptyJournalCard}>
              <Ionicons name="bookmark-outline" size={30} color={colors.blue} />
              <AppText style={styles.h3}>Your field journal starts here</AppText>
              <AppText style={styles.body}>Finish a mission and your first discovery will appear here.</AppText>
            </View>
          ) : latestDiscovery ? (
            <>
              <AppText style={styles.sectionLabel}>LATEST DISCOVERY</AppText>
              <View style={styles.featuredDiscovery}>
                <View style={styles.featuredMedia}>
                  {latestDiscovery.evidence.type === 'photo' ? (
                    <Image source={{ uri: latestDiscovery.evidence.uri }} style={styles.featuredImage} />
                  ) : latestDiscovery.evidence.type === 'audio' ? (
                    <View style={styles.featuredAudio}>
                      <Ionicons name="mic-outline" size={34} color={colors.blue} />
                      <View style={styles.featuredWaveform}>
                        {[24, 48, 34, 70, 42, 58, 30, 64, 38, 52, 28].map((height, index) => (
                          <View key={index} style={[styles.featuredWaveBar, { height }]} />
                        ))}
                      </View>
                      <AppText style={styles.archiveLabel}>AUDIO EVIDENCE</AppText>
                    </View>
                  ) : (
                    <View style={styles.featuredVideo}>
                      <View style={styles.videoBadge}>
                        <Ionicons name="videocam-outline" size={34} color={colors.blue} />
                      </View>
                      <AppText style={styles.archiveLabel}>VIDEO EVIDENCE</AppText>
                    </View>
                  )}
                </View>

                <View style={styles.featuredBody}>
                  <View style={styles.featuredMetaRow}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{latestDiscovery.difficulty}</AppText>
                    </View>
                    <AppText style={styles.discoveryNumber}>MISSION {missionNumberFor(latestDiscovery.missionId)}</AppText>
                  </View>
                  <AppText style={styles.h2}>{latestDiscovery.missionTitle}</AppText>
                  <AppText style={styles.featuredObservation}>{latestDiscovery.observation}</AppText>
                  <View style={styles.featuredFooter}>
                    <AppText style={styles.smallMuted}>{latestDiscovery.location || 'Location not added'}</AppText>
                    <AppText style={styles.smallMuted}>{new Date(latestDiscovery.completedAt).toLocaleDateString()}</AppText>
                  </View>
                  <View style={styles.fieldNoteStamp}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.blue} />
                    <AppText style={styles.archiveLabel}>FIELD NOTE · SAVED</AppText>
                  </View>
                </View>
              </View>
              <PrimaryButton outline label="Open field note" onPress={() => openDiscoveryDetail(latestDiscovery)} />

              {earlierDiscoveries.length > 0 ? (
                <>
                  <AppText style={styles.sectionLabel}>EARLIER DISCOVERIES</AppText>
                  {earlierDiscoveries.map((item, index) => (
                    <View key={item.id} style={styles.discoveryCard}>
                      <View style={styles.discoveryMedia}>
                        {item.evidence.type === 'photo' ? (
                          <Image source={{ uri: item.evidence.uri }} style={styles.discoveryImage} />
                        ) : (
                          <Ionicons
                            name={item.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                            size={30}
                            color={colors.blue}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1, gap: 5 }}>
                        <View style={styles.earlierMetaRow}>
                          <AppText style={styles.eyebrow}>{item.difficulty}</AppText>
                          <AppText style={styles.smallMuted}>MISSION {missionNumberFor(item.missionId)}</AppText>
                        </View>
                        <AppText style={styles.h3}>{item.missionTitle}</AppText>
                        <AppText style={styles.body}>{item.observation}</AppText>
                        <AppText style={styles.smallMuted}>
                          {item.location ? `${item.location} · ` : ''}
                          {new Date(item.completedAt).toLocaleDateString()}
                        </AppText>
                        <Pressable onPress={() => openDiscoveryDetail(item)}>
                          <AppText style={styles.openMission}>OPEN FIELD NOTE →</AppText>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'evidence') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title="Capture evidence"
          onBack={() => setScreen('investigate')}
          onExit={exitMissionToHome}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={2} maxStep={highestStep} onStepPress={goToStep} />
          <AppText style={styles.h1}>Capture what you found</AppText>
          <AppText style={styles.body}>Choose the format that best shows your discovery.</AppText>
          <View style={styles.captureOptions}>
            {captureChoices
            .filter(([mode]) => selectedMission.acceptedEvidence.includes(mode))
            .map(([mode, icon, label]) => (
              <Pressable key={mode} style={styles.captureOption} onPress={() => goCapture(mode)}>
                <View style={styles.optionIcon}>
                  <Ionicons name={icon} size={28} color={colors.blue} />
                </View>
                <AppText style={styles.label}>{label}</AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'investigate') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          title="Investigate"
          onBack={() => setScreen('mission')}
          onExit={exitMissionToHome}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={1} maxStep={highestStep} onStepPress={goToStep} />
          <AppText style={styles.h1}>Look closer</AppText>
          <AppText style={styles.body}>Use the mission question as a guide, then follow the clues you notice.</AppText>
          <View style={styles.questionCard}>
            <AppText style={styles.eyebrow}>YOUR MISSION</AppText>
            <AppText style={styles.h3}>{selectedMission.question}</AppText>
          </View>
          <View style={styles.guidanceCard}>
            <AppText style={styles.label}>Keep investigating</AppText>
            <AppText style={styles.body}>{selectedMission.guidance}</AppText>
          </View>
          {selectedMission.safetyNote ? (
            <View style={styles.safetyCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
              <AppText style={[styles.smallMuted, { flex: 1 }]}>{selectedMission.safetyNote}</AppText>
            </View>
          ) : null}
          {!captureOptionsVisible ? (
            <PrimaryButton
              label="I found something"
              onPress={() => setCaptureOptionsVisible(true)}
            />
          ) : (
            <View style={styles.questionCard}>
              <AppText style={styles.eyebrow}>CAPTURE WHAT YOU FOUND</AppText>
              <AppText style={styles.body}>
                Choose the format that best shows your discovery.
              </AppText>
              <View style={styles.captureOptions}>
                {captureChoices
                .filter(([mode]) => selectedMission.acceptedEvidence.includes(mode))
                .map(([mode, icon, label]) => (
                  <Pressable key={mode} style={styles.captureOption} onPress={() => goCapture(mode)}>
                    <View style={styles.optionIcon}>
                      <Ionicons name={icon} size={28} color={colors.blue} />
                    </View>
                    <AppText style={styles.label}>{label}</AppText>
                  </Pressable>
                ))}
              </View>
              <AppText style={styles.smallMuted}>Nothing is submitted until Step 4.</AppText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'mission') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Mission" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.missionIdentityRow}>
            <MissionNumberMark number={selectedMission.number} />
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{selectedMission.difficulty}</AppText>
            </View>
          </View>
          <AppText style={styles.h1}>{selectedMission.title}</AppText>
          <AppText style={styles.body}>{selectedMission.summary}</AppText>
          <View style={styles.missionRequirements}>
            <AppText style={styles.eyebrow}>ACCEPTED EVIDENCE</AppText>
            <AppText style={styles.label}>
              {selectedMission.acceptedEvidence.map(type => type[0].toUpperCase() + type.slice(1)).join(' · ')}
            </AppText>
            <AppText style={styles.smallMuted}>Short finding required</AppText>
          </View>
          {selectedMission.safetyNote ? (
            <View style={styles.safetyCard}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.blue} />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText style={styles.label}>Explore safely</AppText>
                <AppText style={styles.smallMuted}>{selectedMission.safetyNote}</AppText>
              </View>
            </View>
          ) : null}
          <Stepper active={0} maxStep={highestStep} onStepPress={goToStep} />
          <View style={styles.clueCard}>
            <AppText style={styles.eyebrow}>CLUE 01 · OPEN</AppText>
            <AppText style={styles.h3}>{selectedMission.question}</AppText>
            <AppText style={styles.body}>{selectedMission.guidance}</AppText>
          </View>
          <PrimaryButton
            label="Open the mission"
            onPress={() => {
              updateHighestStep(1);
              setScreen('investigate');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <TopBar title="FIND OUT" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.h1}>Something familiar. Something unnoticed.</AppText>
        <AppText style={styles.body}>Open one mission and investigate it your way.</AppText>

        <AppText style={styles.eyebrow}>FEATURED MISSION</AppText>
        <Pressable
          style={[styles.missionCard, styles.todayMissionCard]}
          onPress={() => openMissionForTest(featuredMission)}
        >
          <View style={styles.featuredMissionMeta}>
            <MissionNumberMark number={featuredMission.number} />
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{featuredMission.difficulty}</AppText>
            </View>
          </View>
          <AppText style={styles.h2}>{featuredMission.title}</AppText>
          <AppText style={styles.body}>{featuredMission.hook}</AppText>
          <AppText style={styles.openMission}>OPEN FEATURED MISSION →</AppText>
        </Pressable>

        <AppText style={styles.eyebrow}>EXPLORE MISSIONS</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRail}
        >
          {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map(filter => {
            const active = missionFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setMissionFilter(filter)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <AppText style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter === 'ALL' ? 'All' : filter[0] + filter.slice(1).toLowerCase()}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        {filteredTestMissions.length === 0 ? (
          <View style={styles.emptyMissionFilter}>
            <AppText style={styles.body}>No other missions match this filter today.</AppText>
          </View>
        ) : (
          filteredTestMissions.map(mission => (
            <Pressable
              key={mission.id}
              style={styles.missionCard}
              onPress={() => openMissionForTest(mission)}
            >
              <View style={styles.missionIdentityRow}>
                <MissionNumberMark number={mission.number} />
                <View style={styles.badge}>
                  <AppText style={styles.badgeText}>{mission.difficulty}</AppText>
                </View>
              </View>
              <AppText style={styles.h3}>{mission.title}</AppText>
              <AppText style={styles.body}>{mission.hook}</AppText>
              <AppText style={styles.openMission}>OPEN MISSION →</AppText>
            </Pressable>
          ))
        )}
        <Pressable style={styles.linkedEvidence} onPress={openMyDiscoveries}>
          <Ionicons name="bookmark-outline" size={26} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.label}>My Discoveries</AppText>
            <AppText style={styles.smallMuted}>Your completed field notes</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
        <Pressable style={styles.linkedEvidence} onPress={() => void openProfile()}>
          <Ionicons name="person-outline" size={26} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.label}>Profile & Trophies</AppText>
            <AppText style={styles.smallMuted}>Titles, trophies and progress</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
        <View style={styles.nativeNote}>
          <Ionicons name="phone-portrait-outline" size={22} color={colors.blue} />
          <AppText style={styles.body}>
            Native MVP: camera, video and audio capture use the real device hardware.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  text: { color: colors.ink, fontFamily: 'Inter_400Regular' },
  content: { padding: 24, gap: 16, paddingBottom: 48 },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
  },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  h1: { ...typography.h1 },
  h2: { ...typography.h2 },
  h3: { ...typography.h3 },
  body: { ...typography.body, color: colors.text },
  label: { ...typography.label },
  smallMuted: { ...typography.small, color: colors.muted },
  eyebrow: { ...typography.tiny, color: colors.blue, letterSpacing: 0.8 },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonText: { ...typography.button, color: colors.white },
  outlineButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  outlineButtonText: { ...typography.button, color: colors.ink },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  stepItem: { alignItems: 'center', flex: 1, gap: 6, minHeight: 48, justifyContent: 'center' },
  stepItemDisabled: { opacity: 0.38 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotUnlocked: {
    backgroundColor: colors.white,
    borderColor: colors.borderStrong,
  },
  stepDotActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  stepNumber: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.muted },
  stepLabel: { ...typography.tiny, color: colors.muted },
  stepLabelUnlocked: { color: colors.text },
  badge: {
  alignSelf: 'flex-start',
  backgroundColor: colors.blueSubtle,
  borderRadius: radius.full,
  paddingHorizontal: 11,
  paddingVertical: 6,
},
badgeText: { ...typography.tiny, color: colors.blue, letterSpacing: 0.55 },
  missionCard: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
  padding: 18,
  gap: 11,
  backgroundColor: colors.white,
},
openMission: { ...typography.label, color: colors.blue, marginTop: 3 },
  clueCard: { backgroundColor: colors.blueSubtle, borderRadius: radius.lg, padding: 20, gap: 14 },
  questionCard: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: 18,
    gap: 8,
  },
  guidanceCard: { backgroundColor: colors.softGrey, borderRadius: radius.md, padding: 16, gap: 6 },
  captureOptions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  captureOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionWrap: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 },
  permissionIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cameraScreen: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  captureHeading: { gap: 8 },
  camera: { flex: 1, minHeight: 330, borderRadius: radius.lg, overflow: 'hidden' },
  recordBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: 'rgba(17,19,24,0.72)',
  },
  recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  recordText: { ...typography.tiny, color: colors.white },
  photoControls: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideControl: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  audioPanel: {
    minHeight: 360,
    borderRadius: radius.lg,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    padding: 24,
  },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 56 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: colors.blue },
  timer: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  centerMeta: { ...typography.small, color: colors.muted, textAlign: 'center' },
  previewPanel: {
    minHeight: 360,
    borderRadius: radius.lg,
    backgroundColor: colors.soft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: 360, resizeMode: 'contain', backgroundColor: colors.soft },
  mediaReviewWrap: { gap: 12 },
  previewVideo: {
    width: '100%',
    height: 360,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  mediaMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mediaMeta: { ...typography.label, color: colors.text },
  audioReviewCard: {
    minHeight: 330,
    borderRadius: radius.lg,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    padding: 24,
  },
  audioReviewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    minHeight: 48,
    borderRadius: radius.full,
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  playButtonText: { ...typography.button, color: colors.white },
  field: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: 14,
    gap: 8,
  },
  input: {
    minHeight: 48,
    color: colors.ink,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  linkedEvidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.blueSubtle,
    borderRadius: radius.md,
    padding: 14,
  },
  draftNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 2,
  },
  completeWrap: { alignItems: 'center', gap: 18, paddingTop: 60 },
  archiveSummary: {
    minHeight: 92,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  archiveCount: { fontFamily: 'Archivo_600SemiBold', fontSize: 34, lineHeight: 38, color: colors.ink },
  archiveLabel: { ...typography.tiny, color: colors.muted, letterSpacing: 0.8 },
  archiveSavedRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 3 },
  archiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime },
  sectionLabel: { ...typography.tiny, color: colors.muted, letterSpacing: 1.1, marginTop: 8 },
  emptyJournalCard: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.blueSubtle,
  },
  featuredDiscovery: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  featuredMedia: { height: 230, backgroundColor: colors.soft, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredAudio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, backgroundColor: colors.blueSubtle },
  featuredWaveform: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 76 },
  featuredWaveBar: { width: 5, borderRadius: 3, backgroundColor: colors.blue },
  featuredVideo: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.softGrey },
  videoBadge: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blueSubtle },
  featuredBody: { padding: 20, gap: 12 },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  discoveryNumber: { ...typography.tiny, color: colors.muted, letterSpacing: 0.8 },
  featuredObservation: { ...typography.bodyMedium, color: colors.ink },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  fieldNoteStamp: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 7 },
  discoveryCard: {
    flexDirection: 'row',
    gap: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  discoveryMedia: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  earlierMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayMissionCard: {
  borderColor: colors.borderStrong,
  borderLeftWidth: 3,
  borderLeftColor: colors.lime,
  backgroundColor: colors.white,
},
featuredMissionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
missionIdentityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
missionNumberMark: { flexDirection: 'row', alignItems: 'center', gap: 9 },
missionNumberRule: {
  width: 3,
  height: 34,
  borderRadius: radius.full,
  backgroundColor: colors.lime,
},
missionNumberCopy: { gap: 0 },
missionNumberWord: {
  ...typography.tiny,
  color: colors.muted,
  letterSpacing: 1.15,
},
missionNumberDigits: {
  fontFamily: 'Archivo_600SemiBold',
  fontSize: 22,
  lineHeight: 24,
  color: colors.ink,
  letterSpacing: 0.2,
},
filterRail: { gap: 8, paddingRight: 8 },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  filterChipActive: { backgroundColor: colors.blueSubtle, borderColor: colors.blue },
  filterChipText: { ...typography.label, color: colors.text },
  filterChipTextActive: { color: colors.blue },
  emptyMissionFilter: { paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border },
  reviewStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
  },
  detailEvidenceImage: {
    width: '100%',
    height: 300,
    borderRadius: radius.lg,
    resizeMode: 'cover',
    backgroundColor: colors.soft,
  },
  detailEvidencePlaceholder: {
    minHeight: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.softGrey,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missionRequirements: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: 16,
    gap: 6,
    backgroundColor: colors.white,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
  },
  trophyUnlockWrap: { width: '100%', gap: 10 },
  trophyUnlockCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.limeSubtle,
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignSelf: 'center',
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedTitleCard: {
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: 8,
    backgroundColor: colors.blueSubtle,
  },
  trophyCardNative: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    backgroundColor: colors.white,
  },
  trophyCardLockedNative: { opacity: 0.7, backgroundColor: colors.softGrey },
  trophyIconNative: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipPill: {
    minHeight: 36,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSubtle,
  },
  nativeNote: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
  },
});
