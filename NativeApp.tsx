import React, { useRef, useState } from 'react';
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
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
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
import { activeMission } from './src/data';
import { colors, radius, typography } from './src/theme';

type Screen =
  | 'discover'
  | 'mission'
  | 'investigate'
  | 'evidence'
  | 'capture'
  | 'preview'
  | 'document'
  | 'complete';

type CaptureMode = 'photo' | 'video' | 'audio';

type Evidence = {
  type: CaptureMode;
  uri: string;
  durationMs?: number;
};

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

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable style={styles.hit} onPress={onBack} disabled={!onBack}>
        {onBack ? <Ionicons name="chevron-back" size={24} color={colors.ink} /> : null}
      </Pressable>
      <AppText style={styles.topTitle}>{title}</AppText>
      <View style={styles.hit} />
    </View>
  );
}

function Stepper({ active }: { active: number }) {
  const labels = ['Notice', 'Investigate', 'Document', 'Submit'];
  return (
    <View style={styles.stepper}>
      {labels.map((label, index) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepDot, index === active && styles.stepDotActive]}>
            <AppText style={[styles.stepNumber, index === active && { color: colors.white }]}>
              {index + 1}
            </AppText>
          </View>
          <AppText style={[styles.stepLabel, index === active && { color: colors.blue }]}>
            {label}
          </AppText>
        </View>
      ))}
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
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function NativeApp() {
  const [archivoLoaded] = useArchivoFonts({ Archivo_600SemiBold });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });
  const [screen, setScreen] = useState<Screen>('discover');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('audio');
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [observation, setObservation] = useState('The crossing signal carries farther than I noticed.');
  const [location, setLocation] = useState('');

  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [videoMicPermission, requestVideoMicPermission] = useMicrophonePermissions();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioState = useAudioRecorderState(audioRecorder, 200);

  if (!archivoLoaded || !interLoaded) return null;

  const goCapture = (mode: CaptureMode) => {
    setCaptureMode(mode);
    setEvidence(null);
    setCameraReady(false);
    setScreen('capture');
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!result?.uri) return;
      setEvidence({ type: 'photo', uri: result.uri });
      setScreen('preview');
    } catch (error) {
      Alert.alert('Camera error', error instanceof Error ? error.message : 'Could not take photo.');
    }
  };

  const toggleVideo = async () => {
    if (!cameraRef.current || !cameraReady) return;

    if (isVideoRecording) {
      cameraRef.current.stopRecording();
      return;
    }

    try {
      setIsVideoRecording(true);
      const result = await cameraRef.current.recordAsync({ maxDuration: 60 });
      if (result?.uri) {
        setEvidence({ type: 'video', uri: result.uri });
        setScreen('preview');
      }
    } catch (error) {
      Alert.alert('Video error', error instanceof Error ? error.message : 'Could not record video.');
    } finally {
      setIsVideoRecording(false);
    }
  };

  const toggleAudio = async () => {
    try {
      if (audioState.isRecording) {
        await audioRecorder.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        const uri = audioRecorder.uri ?? audioState.url;
        if (uri) {
          setEvidence({ type: 'audio', uri, durationMs: audioState.durationMillis });
          setScreen('preview');
        }
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone access needed', 'Allow microphone access to record audio evidence.');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert('Audio error', error instanceof Error ? error.message : 'Could not record audio.');
    }
  };

  const renderCapture = () => {
    if (captureMode === 'audio') {
      return (
        <SafeAreaView style={styles.safe}>
          <TopBar title="Record audio" onBack={() => setScreen('evidence')} />
          <ScrollView contentContainerStyle={styles.content}>
            <AppText style={styles.h1}>Capture the sound</AppText>
            <AppText style={styles.body}>Stay nearby and capture the sound clearly.</AppText>
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
          <TopBar title={captureMode === 'photo' ? 'Take photo' : 'Record video'} onBack={() => setScreen('evidence')} />
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
          <TopBar title="Record video" onBack={() => setScreen('evidence')} />
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
        <TopBar title={captureMode === 'photo' ? 'Take photo' : 'Record video'} onBack={() => setScreen('evidence')} />
        <View style={styles.cameraScreen}>
          <View style={styles.captureHeading}>
            <AppText style={styles.h2}>{captureMode === 'photo' ? 'Frame your discovery' : 'Capture what you found'}</AppText>
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
                <AppText style={styles.recordText}>{isVideoRecording ? 'REC' : 'READY'}</AppText>
              </View>
            ) : null}
          </CameraView>
          {captureMode === 'photo' ? (
            <View style={styles.photoControls}>
              <View style={styles.sideControl} />
              <Pressable onPress={takePhoto} disabled={!cameraReady} style={styles.shutterOuter}>
                <View style={styles.shutterInner} />
              </Pressable>
              <Pressable
                style={styles.sideControl}
                onPress={() => setFacing((value) => (value === 'back' ? 'front' : 'back'))}
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
        <TopBar title="Review evidence" onBack={() => setScreen('capture')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.h1}>Check your evidence</AppText>
          <AppText style={styles.body}>Make sure it clearly shows what you discovered.</AppText>
          <View style={styles.previewPanel}>
            {evidence.type === 'photo' ? (
              <Image source={{ uri: evidence.uri }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons
                  name={evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                  size={64}
                  color={colors.blue}
                />
                <AppText style={styles.h3}>
                  {evidence.type === 'video' ? 'Video captured' : `Audio captured · ${formatDuration(evidence.durationMs)}`}
                </AppText>
              </>
            )}
          </View>
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
        <TopBar title="Document" onBack={() => setScreen('preview')} />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={2} />
          <AppText style={styles.eyebrow}>FIELD NOTE · 03</AppText>
          <AppText style={styles.h1}>Describe what you found</AppText>
          <AppText style={styles.body}>Add just enough context for someone else to understand what you found.</AppText>
          <View style={styles.field}>
            <AppText style={styles.label}>Observation</AppText>
            <TextInput multiline value={observation} onChangeText={setObservation} style={styles.input} />
          </View>
          <View style={styles.field}>
            <AppText style={styles.label}>Location</AppText>
            <TextInput value={location} onChangeText={setLocation} placeholder="Optional place name" placeholderTextColor={colors.muted} style={styles.input} />
          </View>
          <View style={styles.linkedEvidence}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.blue} />
            <AppText style={styles.body}>{evidence?.type.toUpperCase()} evidence linked</AppText>
          </View>
          <PrimaryButton label="Submit discovery" onPress={() => setScreen('complete')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Mission complete" />
        <View style={styles.completeWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={34} color={colors.ink} />
          </View>
          <AppText style={styles.h1}>Discovery submitted</AppText>
          <AppText style={styles.body}>Your real evidence has been captured and attached to this mission entry.</AppText>
          <PrimaryButton label="Explore another mission" onPress={() => setScreen('discover')} />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'evidence') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Capture evidence" onBack={() => setScreen('investigate')} />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={2} />
          <AppText style={styles.h1}>Capture what you found</AppText>
          <AppText style={styles.body}>Choose the format that best shows your discovery.</AppText>
          <View style={styles.captureOptions}>
            {([
              ['photo', 'camera-outline', 'Photo'],
              ['video', 'videocam-outline', 'Video'],
              ['audio', 'mic-outline', 'Audio'],
            ] as const).map(([mode, icon, label]) => (
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
        <TopBar title="Investigate" onBack={() => setScreen('mission')} />
        <ScrollView contentContainerStyle={styles.content}>
          <Stepper active={1} />
          <AppText style={styles.h1}>Follow the signal</AppText>
          <AppText style={styles.body}>Move slowly. Let one detail lead you to the next.</AppText>
          <View style={styles.questionCard}>
            <AppText style={styles.eyebrow}>YOUR MISSION</AppText>
            <AppText style={styles.h3}>What familiar sound are you following?</AppText>
          </View>
          <View style={styles.guidanceCard}>
            <AppText style={styles.label}>Pay closer attention</AppText>
            <AppText style={styles.body}>Notice what stands out, then decide what matters.</AppText>
          </View>
          <PrimaryButton label="I found something" onPress={() => setScreen('evidence')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'mission') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Mission" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.badge}><AppText style={styles.badgeText}>{activeMission.category}</AppText></View>
          <AppText style={styles.h1}>{activeMission.title}</AppText>
          <AppText style={styles.body}>{activeMission.summary}</AppText>
          <Stepper active={0} />
          <View style={styles.clueCard}>
            <AppText style={styles.eyebrow}>CLUE 01 · OPEN</AppText>
            <AppText style={styles.h3}>{activeMission.question}</AppText>
            <AppText style={styles.body}>{activeMission.guidance}</AppText>
          </View>
          <PrimaryButton label="Open the mission" onPress={() => setScreen('investigate')} />
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
        <Pressable style={styles.missionCard} onPress={() => setScreen('mission')}>
          <View style={styles.badge}><AppText style={styles.badgeText}>{activeMission.category}</AppText></View>
          <AppText style={styles.h3}>{activeMission.title}</AppText>
          <AppText style={styles.body}>{activeMission.hook}</AppText>
          <AppText style={styles.openMission}>OPEN MISSION →</AppText>
        </Pressable>
        <View style={styles.nativeNote}>
          <Ionicons name="phone-portrait-outline" size={22} color={colors.blue} />
          <AppText style={styles.body}>Native MVP: camera, video and audio capture use the real device hardware.</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  text: { color: colors.ink, fontFamily: 'Inter_400Regular' },
  content: { padding: 24, gap: 18, paddingBottom: 48 },
  topBar: { height: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 12 },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 14 },
  h1: { ...typography.h1 },
  h2: { fontFamily: 'Archivo_600SemiBold', fontSize: 26, lineHeight: 32 },
  h3: { ...typography.h3 },
  body: { ...typography.body, color: colors.text },
  label: { ...typography.label },
  eyebrow: { ...typography.tiny, color: colors.blue, letterSpacing: 0.8 },
  primaryButton: { minHeight: 48, borderRadius: radius.md, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonText: { ...typography.button, color: colors.white },
  outlineButton: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  outlineButtonText: { ...typography.button, color: colors.ink },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  stepItem: { alignItems: 'center', flex: 1, gap: 6 },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  stepNumber: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  stepLabel: { ...typography.tiny, color: colors.muted },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.blueSubtle, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  badgeText: { ...typography.tiny, color: colors.blue },
  missionCard: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, padding: 20, gap: 14 },
  openMission: { ...typography.label, color: colors.blue, marginTop: 6 },
  clueCard: { backgroundColor: colors.blueSubtle, borderRadius: radius.lg, padding: 20, gap: 14 },
  questionCard: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, padding: 18, gap: 8 },
  guidanceCard: { backgroundColor: colors.softGrey, borderRadius: radius.md, padding: 16, gap: 6 },
  captureOptions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  captureOption: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingVertical: 18, alignItems: 'center', gap: 10 },
  optionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.blueSubtle, alignItems: 'center', justifyContent: 'center' },
  permissionWrap: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 },
  permissionIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.blueSubtle, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  cameraScreen: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  captureHeading: { gap: 8, paddingTop: 16 },
  camera: { flex: 1, minHeight: 360, borderRadius: radius.lg, overflow: 'hidden' },
  recordBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, backgroundColor: 'rgba(17,19,24,0.72)' },
  recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  recordText: { ...typography.tiny, color: colors.white },
  photoControls: { height: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideControl: { width: 64, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.blueSubtle },
  shutterOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderStrong },
  audioPanel: { minHeight: 360, borderRadius: radius.lg, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 56 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: colors.blue },
  timer: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  centerMeta: { ...typography.small, color: colors.muted, textAlign: 'center' },
  previewPanel: { minHeight: 360, borderRadius: radius.lg, backgroundColor: colors.soft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 18 },
  previewImage: { width: '100%', height: 360, resizeMode: 'cover' },
  field: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: 14, gap: 8 },
  input: { minHeight: 48, color: colors.ink, fontFamily: 'Inter_400Regular', fontSize: 15, textAlignVertical: 'top' },
  linkedEvidence: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.blueSubtle, borderRadius: radius.md, padding: 14 },
  completeWrap: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 18 },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  nativeNote: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: radius.md, backgroundColor: colors.blueSubtle },
});
