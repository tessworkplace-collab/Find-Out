import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
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
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { activeMission } from './src/data';
import {
  clearDraft,
  loadDraft,
  persistEvidenceFile,
  removePersistedEvidence,
  saveDraft,
} from './src/draftStorage';
import {
  addCompletedDiscovery,
  CompletedDiscovery,
  loadCompletedDiscoveries,
  updateCompletedDiscovery,
} from './src/discoveryStorage';
import { colors, radius, typography } from './src/theme';
import {
  ProductCollectionScreen,
  ProductCompleteScreen,
  ProductDiscoverScreen,
  ProductDocumentScreen,
  ProductEvidenceDetailScreen,
  ProductEvidencePickerScreen,
  ProductEvidencePreviewScreen,
  ProductInvestigateScreen,
  ProductMissionDetailScreen,
  ProductProfileScreen,
  ProductTrophiesScreen,
} from './src/components/FigmaProductScreens';

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
  | 'profile'
  | 'trophies'
  | 'discovery-detail';

type CaptureMode = 'photo' | 'video' | 'audio';

const MISSION_DRAFT_SCREENS: Screen[] = [
  'mission',
  'investigate',
  'evidence',
  'capture',
  'preview',
  'document',
  'complete',
];

type Evidence = {
  type: CaptureMode;
  uri: string;
  durationMs?: number;
};

const DEFAULT_OBSERVATION = 'The crossing signal carries farther than I noticed.';
const AUDIO_MAX_DURATION_MS = 10_000;

function AppText({ children, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
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
        const isCompleted = index < active;

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
                isCompleted && styles.stepDotCompleted,
                isActive && styles.stepDotActive,
              ]}
            >
              <AppText
                style={[
                  styles.stepNumber,
                  isActive && { color: colors.white },
                  isUnlocked && !isActive && { color: colors.text },
                  isCompleted && { color: colors.ink },
                ]}
              >
                {index + 1}
              </AppText>
            </View>
            <AppText
              style={[
                styles.stepLabel,
                isUnlocked && !isActive && styles.stepLabelUnlocked,
                isCompleted && { color: colors.ink },
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

function VideoEvidencePreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, videoPlayer => {
    videoPlayer.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.previewVideo}
      nativeControls
      contentFit="contain"
    />
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
        <Ionicons name="mic-outline" size={34} color={colors.white} />
      </View>
      <View style={styles.waveform}>
        {[18, 34, 24, 48, 30, 42, 20, 36, 26, 44, 22].map((height, index) => (
          <View key={index} style={[styles.waveBar, { height }]} />
        ))}
      </View>
      <AppText style={[styles.timer, styles.previewTimer]}>
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
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [screen, setScreen] = useState<Screen>('discover');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('audio');
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
  const [discoveries, setDiscoveries] = useState<CompletedDiscovery[]>([]);
  const [selectedDiscovery, setSelectedDiscovery] = useState<CompletedDiscovery | null>(null);
  const [editingDiscoveryId, setEditingDiscoveryId] = useState<string | null>(null);
  const [editingObservation, setEditingObservation] = useState('');
  const [editingLocation, setEditingLocation] = useState('');
  const [submittingDiscovery, setSubmittingDiscovery] = useState(false);

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

        if (!MISSION_DRAFT_SCREENS.includes(draft.screen as Screen)) {
          await clearDraft().catch(() => undefined);
          return;
        }

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

    // Browsing saved work must never replace the user's active mission draft.
    if (editingDiscoveryId || !MISSION_DRAFT_SCREENS.includes(screen)) return;

    const restorableScreen =
      screen === 'capture' || screen === 'preview'
        ? evidence
          ? 'document'
          : 'investigate'
        : screen;

    const timer = setTimeout(() => {
      saveDraft({
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
    editingDiscoveryId,
  ]);

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
    try {
      await clearDraft(evidence);
    } catch {
      // Reset the UI even if local cleanup fails.
    }
    setEvidence(null);
    setSubmitted(false);
    setHighestStep(0);
    setObservation(DEFAULT_OBSERVATION);
    setLocation('');
    setCaptureMode('audio');
    setScreen('discover');
  };

  const openMyDiscoveries = async () => {
    const saved = await loadCompletedDiscoveries();
    setDiscoveries(saved);
    setScreen('discoveries');
  };

  const openDiscoveryDetail = (id: string) => {
    const selected = discoveries.find(item => item.id === id);
    if (!selected) return;
    setSelectedDiscovery(selected);
    setScreen('discovery-detail');
  };

  const editSelectedDiscovery = () => {
    if (!selectedDiscovery) return;
    setEditingDiscoveryId(selectedDiscovery.id);
    setEditingObservation(selectedDiscovery.observation);
    setEditingLocation(selectedDiscovery.location);
    setScreen('document');
  };

  const cancelEditingDiscovery = () => {
    setEditingDiscoveryId(null);
    setEditingObservation('');
    setEditingLocation('');
    setScreen('discovery-detail');
  };

  const shareSelectedDiscovery = async () => {
    if (!selectedDiscovery) return;
    try {
      await Share.share({
        message: `${selectedDiscovery.missionTitle}\n\n${selectedDiscovery.observation}`,
      });
    } catch {
      Alert.alert('Could not share discovery', 'Please try the share button again.');
    }
  };

  const submitDiscovery = async () => {
    if (submittingDiscovery || (!editingDiscoveryId && !evidence)) return;

    setSubmittingDiscovery(true);
    try {
      if (editingDiscoveryId) {
        const updated = await updateCompletedDiscovery(editingDiscoveryId, {
          observation: editingObservation,
          location: editingLocation,
        });
        setDiscoveries(current =>
          current.map(item => (item.id === updated.id ? updated : item)),
        );
        setSelectedDiscovery(updated);
        setEditingDiscoveryId(null);
        setEditingObservation('');
        setEditingLocation('');
        setScreen('discovery-detail');
        return;
      }

      if (!evidence) return;

      const completed = await addCompletedDiscovery({
        missionId: activeMission.id,
        missionTitle: activeMission.title,
        category: activeMission.category,
        observation,
        location,
        evidence,
      });
      setDiscoveries(current => [completed, ...current.filter(item => item.id !== completed.id)]);
      setSubmitted(true);
      updateHighestStep(3);
      setScreen('complete');
    } catch (error) {
      Alert.alert(
        'Could not save discovery',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSubmittingDiscovery(false);
    }
  };

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

  if (screen === 'discovery-detail' && selectedDiscovery) {
    const selectedIndex = discoveries.findIndex(item => item.id === selectedDiscovery.id);
    const day = selectedIndex <= 0 ? 'TODAY' : 'EARLIER';
    const media =
      selectedDiscovery.evidence.type === 'photo' ? (
        <Image
          source={{ uri: selectedDiscovery.evidence.uri }}
          style={styles.previewImage}
        />
      ) : selectedDiscovery.evidence.type === 'video' ? (
        <VideoEvidencePreview uri={selectedDiscovery.evidence.uri} />
      ) : (
        <AudioEvidencePreview
          uri={selectedDiscovery.evidence.uri}
          durationMs={selectedDiscovery.evidence.durationMs}
        />
      );

    return (
      <SafeAreaView style={styles.safe}>
        <ProductEvidenceDetailScreen
          title={selectedDiscovery.missionTitle}
          day={day}
          note={selectedDiscovery.observation}
          media={media}
          onBack={() => setScreen('discoveries')}
          onEdit={editSelectedDiscovery}
          onShare={() => void shareSelectedDiscovery()}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'preview' && evidence) {
    const mediaLabel =
      evidence.type === 'photo'
        ? 'PHOTO'
        : evidence.type === 'video'
          ? `VIDEO · ${formatDuration(evidence.durationMs ?? 0)}`
          : `AUDIO · ${formatDuration(evidence.durationMs ?? 0)}`;

    const media =
      evidence.type === 'photo' ? (
        <Image source={{ uri: evidence.uri }} style={styles.previewImage} />
      ) : evidence.type === 'video' ? (
        <VideoEvidencePreview uri={evidence.uri} />
      ) : (
        <AudioEvidencePreview uri={evidence.uri} durationMs={evidence.durationMs} />
      );

    return (
      <SafeAreaView style={styles.safe}>
        <ProductEvidencePreviewScreen
          media={media}
          mediaLabel={mediaLabel}
          onBack={() => setScreen('capture')}
          onExit={exitMissionToHome}
          onUse={() => setScreen('document')}
          onRetake={() => setScreen('capture')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'document') {
    const editingDiscovery = Boolean(editingDiscoveryId);
    return (
      <SafeAreaView style={styles.safe}>
        <ProductDocumentScreen
          observation={editingDiscovery ? editingObservation : observation}
          location={editingDiscovery ? editingLocation : location}
          onChangeObservation={
            editingDiscovery ? setEditingObservation : setObservation
          }
          onChangeLocation={editingDiscovery ? setEditingLocation : setLocation}
          onBack={
            editingDiscovery
              ? cancelEditingDiscovery
              : () => setScreen(evidence ? 'preview' : 'investigate')
          }
          onExit={editingDiscovery ? undefined : exitMissionToHome}
          onDiscard={editingDiscovery ? undefined : resetMission}
          onSubmit={submitDiscovery}
          onStepPress={editingDiscovery ? undefined : goToStep}
          maxStep={editingDiscovery ? 2 : highestStep}
          submitLabel={
            submittingDiscovery
              ? editingDiscovery
                ? 'Saving changes…'
                : 'Saving discovery…'
              : editingDiscovery
                ? 'Save changes'
                : 'Submit discovery'
          }
          submitDisabled={
            submittingDiscovery ||
            (editingDiscovery
              ? editingObservation.trim().length === 0
              : !evidence)
          }
        />
      </SafeAreaView>
    );
  }

  if (screen === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductCompleteScreen
          onClose={() => setScreen('discover')}
          onOtherDiscoveries={openMyDiscoveries}
          onExplore={resetMission}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'discoveries') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductCollectionScreen
          activeMissionTitle={activeMission.title}
          evidence={discoveries.slice(0, 2).map((item, index) => ({
            id: item.id,
            day: index === 0 ? 'TODAY' : 'EARLIER',
            title: item.missionTitle,
            note: item.observation,
            mediaUri: item.evidence.type === 'photo' ? item.evidence.uri : undefined,
          }))}
          onContinue={() => setScreen('investigate')}
          onEvidence={openDiscoveryDetail}
          onDiscover={() => setScreen('discover')}
          onProfile={() => setScreen('profile')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'evidence') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductEvidencePickerScreen
          onBack={() => setScreen('investigate')}
          onExit={exitMissionToHome}
          onSelect={goCapture}
          onStepPress={goToStep}
          maxStep={highestStep}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'investigate') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductInvestigateScreen
          question={activeMission.question}
          onBack={() => setScreen('mission')}
          onExit={exitMissionToHome}
          onFound={() => {
            updateHighestStep(2);
            setScreen('evidence');
          }}
          onStepPress={goToStep}
          maxStep={highestStep}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'mission') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductMissionDetailScreen
          number={activeMission.number}
          difficulty="MEDIUM"
          evidence="Photo"
          title={activeMission.title}
          summary={activeMission.summary}
          question={activeMission.question}
          guidance={activeMission.guidance}
          onBack={() => setScreen('discover')}
          onOpen={() => {
            updateHighestStep(1);
            setScreen('investigate');
          }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'profile') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductProfileScreen
          onDiscover={() => setScreen('discover')}
          onCollection={openMyDiscoveries}
          onTrophies={() => setScreen('trophies')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'trophies') {
    return (
      <SafeAreaView style={styles.safe}>
        <ProductTrophiesScreen
          onBack={() => setScreen('profile')}
          onDiscover={() => setScreen('discover')}
          onCollection={openMyDiscoveries}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ProductDiscoverScreen
        onOpenFeatured={() => setScreen('mission')}
        onOpenMission={() => setScreen('mission')}
        onCollection={openMyDiscoveries}
        onProfile={() => setScreen('profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  text: { color: colors.ink, fontFamily: 'Inter_400Regular' },
  content: { padding: 24, gap: 18, paddingBottom: 48 },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
  },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 14 },
  h1: { ...typography.h1 },
  h2: { fontFamily: 'Archivo_600SemiBold', fontSize: 26, lineHeight: 32 },
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
  stepDotCompleted: {
    backgroundColor: colors.limeSubtle,
    borderColor: colors.limeSubtle,
  },
  stepDotActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  stepNumber: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.muted },
  stepLabel: { ...typography.tiny, color: colors.muted },
  stepLabelUnlocked: { color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.blueSubtle,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: { ...typography.tiny, color: colors.blue },
  missionCard: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: 20,
    gap: 14,
  },
  openMission: { ...typography.label, color: colors.blue, marginTop: 6 },
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
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: colors.ink,
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.ink,
  },
  audioReviewCard: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
  },
  audioReviewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34353C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTimer: {
    color: colors.white,
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
  discoveryNumber: { fontFamily: 'Archivo_600SemiBold', fontSize: 20, color: colors.muted },
  featuredObservation: { ...typography.body, color: colors.ink, fontSize: 17, lineHeight: 25 },
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
  nativeNote: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
  },
});
