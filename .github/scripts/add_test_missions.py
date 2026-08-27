from pathlib import Path

native_path = Path('NativeApp.tsx')
text = native_path.read_text()


def one(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)


one(
    "import { activeMission } from './src/data';",
    "import { activeMission, missions, Mission } from './src/data';",
    'mission import',
)

# Make all native mission screens follow the selected mission instead of the fixed starter mission.
text = text.replace('activeMission.', 'selectedMission.')

one(
    "const AUDIO_MAX_DURATION_MS = 10_000;",
    """const AUDIO_MAX_DURATION_MS = 10_000;
const TEST_MISSION_IDS = [
  'why-is-this-here',
  'the-queue',
  'dead-link',
  'no-reviews-yet',
  'offline-famous',
  'local-knowledge',
];
const testMissions = missions.filter(mission => TEST_MISSION_IDS.includes(mission.id));""",
    'test mission constants',
)

one(
    "  const [screen, setScreen] = useState<Screen>('discover');",
    """  const [screen, setScreen] = useState<Screen>('discover');
  const [selectedMission, setSelectedMission] = useState<Mission>(activeMission);""",
    'selected mission state',
)

one(
    """        setCaptureMode(draft.captureMode);
        setEvidence(restoredEvidence);""",
    """        const restoredMission = draft.missionId
          ? missions.find(mission => mission.id === draft.missionId)
          : undefined;
        if (restoredMission) setSelectedMission(restoredMission);

        setCaptureMode(draft.captureMode);
        setEvidence(restoredEvidence);""",
    'restore selected mission',
)

one(
    """      saveDraft({
        screen: restorableScreen,""",
    """      saveDraft({
        missionId: selectedMission.id,
        screen: restorableScreen,""",
    'autosave mission id',
)

one(
    """      await saveDraft({
        screen: getRestorableScreen(),""",
    """      await saveDraft({
        missionId: selectedMission.id,
        screen: getRestorableScreen(),""",
    'exit save mission id',
)

one(
    """  const openMyDiscoveries = async () => {
    const saved = await loadCompletedDiscoveries();""",
    """  const openMissionForTest = async (mission: Mission) => {
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
  };

  const openMyDiscoveries = async () => {
    const saved = await loadCompletedDiscoveries();""",
    'mission picker helper',
)

one(
    """        <Pressable style={styles.missionCard} onPress={() => setScreen('mission')}>
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>{selectedMission.difficulty}</AppText>
          </View>
          <AppText style={styles.h3}>{selectedMission.title}</AppText>
          <AppText style={styles.body}>{selectedMission.hook}</AppText>
          <AppText style={styles.openMission}>OPEN MISSION →</AppText>
        </Pressable>""",
    """        <AppText style={styles.eyebrow}>TRY A MISSION</AppText>
        {testMissions.map(mission => (
          <Pressable
            key={mission.id}
            style={styles.missionCard}
            onPress={() => openMissionForTest(mission)}
          >
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{mission.difficulty}</AppText>
            </View>
            <AppText style={styles.h3}>{mission.title}</AppText>
            <AppText style={styles.body}>{mission.hook}</AppText>
            <AppText style={styles.openMission}>OPEN MISSION →</AppText>
          </Pressable>
        ))}""",
    'native home mission list',
)

native_path.write_text(text)

draft_path = Path('src/draftStorage.ts')
draft = draft_path.read_text()
old = """export type DraftSnapshot = {
  screen: string;"""
new = """export type DraftSnapshot = {
  missionId?: string;
  screen: string;"""
count = draft.count(old)
if count != 1:
    raise SystemExit(f'draft mission id: expected 1 match, found {count}')
draft_path.write_text(draft.replace(old, new, 1))
