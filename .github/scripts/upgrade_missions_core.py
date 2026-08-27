from pathlib import Path

p = Path('NativeApp.tsx')
s = p.read_text()

def r(old, new, label):
    global s
    c = s.count(old)
    if c != 1:
        raise SystemExit(f'{label}: {c}')
    s = s.replace(old, new, 1)

r("""import {
  addCompletedDiscovery,
  approveCompletedDiscovery,
  CompletedDiscovery,
  loadCompletedDiscoveries,
  updateCompletedDiscovery,
} from './src/discoveryStorage';
import { colors, radius, typography } from './src/theme';""",
"""import {
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
import { colors, radius, typography } from './src/theme';""", 'imports')

r("""  | 'discoveries'
  | 'discovery-detail'
  | 'edit-discovery';""",
"""  | 'discoveries'
  | 'discovery-detail'
  | 'edit-discovery'
  | 'profile'
  | 'trophies';""", 'screens')

start = s.index("const DEFAULT_OBSERVATION = '';")
end = s.index("function missionNumberFor", start)
replacement = """const DEFAULT_OBSERVATION = '';
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

"""
s = s[:start] + replacement + s[end:]

r("""  const [missionFilter, setMissionFilter] = useState<MissionFilter>('ALL');
  const [selectedDiscovery, setSelectedDiscovery] = useState<CompletedDiscovery | null>(null);
  const [editObservation, setEditObservation] = useState('');
  const [editLocation, setEditLocation] = useState('');""",
"""  const [missionFilter, setMissionFilter] = useState<MissionFilter>('ALL');
  const [missionOffers, setMissionOffers] = useState<Mission[]>(() => createMissionOffers());
  const [selectedDiscovery, setSelectedDiscovery] = useState<CompletedDiscovery | null>(null);
  const [editObservation, setEditObservation] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [progression, setProgression] = useState<ProgressionState>({ unlockedTrophies: [], equippedTitleId: null });
  const [newlyUnlockedTrophyIds, setNewlyUnlockedTrophyIds] = useState<TrophyId[]>([]);""", 'state')

r("""  useEffect(() => {
    if (!isVideoRecording) return;""",
"""  useEffect(() => {
    loadProgression().then(setProgression).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isVideoRecording) return;""", 'progression load')

r("""  const goCapture = (mode: CaptureMode) => {
    setCaptureMode(mode);""",
"""  const goCapture = (mode: CaptureMode) => {
    if (!selectedMission.acceptedEvidence.includes(mode)) return;
    setCaptureMode(mode);""", 'capture guard')

old = """  const resetMission = async () => {
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
    setCaptureMode('photo');
    setCaptureOptionsVisible(false);
    setScreen('discover');
  };

  const openMissionForTest = async (mission: Mission) => {
    try {
      await clearDraft(evidence);
    } catch {
      // Starting another test mission should still reset the visible flow.
    }
    setSelectedMission(mission);
    setEvidence(null);
    setSubmitted(false);
    setHighestStep(0);
    setObservation(DEFAULT_OBSERVATION);
    setLocation('');
    setCaptureMode('photo');
    setCaptureOptionsVisible(false);
    setScreen('mission');
  };"""
new = """  const resetMission = async () => {
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
  };"""
r(old, new, 'rotation')

r("""  const submitDiscovery = async () => {
    if (!evidence || submittingDiscovery) return;

    setSubmittingDiscovery(true);
    try {
      const completed = await addCompletedDiscovery({
        missionId: selectedMission.id,
        missionTitle: selectedMission.title,
        category: selectedMission.difficulty,
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

  const missionOfDay = getMissionOfDay();
  const filteredTestMissions = testMissions
    .filter(mission => missionFilter === 'ALL' || mission.difficulty === missionFilter)
    .filter(mission => mission.id !== missionOfDay.id);""",
"""  const submitDiscovery = async () => {
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
    .filter(mission => mission.id !== featuredMission.id);""", 'submit')

s = s.replace('selectedDiscovery.category', 'selectedDiscovery.difficulty')
s = s.replace('latestDiscovery.category', 'latestDiscovery.difficulty')
s = s.replace('item.category', 'item.difficulty')
s = s.replace('MISSION OF THE DAY', 'FEATURED MISSION')
s = s.replace('missionOfDay', 'featuredMission')
s = s.replace("TODAY'S PICK", 'ROTATING PICK')
s = s.replace("OPEN TODAY'S MISSION →", 'OPEN FEATURED MISSION →')

p.write_text(s)
