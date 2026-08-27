from pathlib import Path


def one(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


# ---- discovery storage ----------------------------------------------------
storage_path = Path('src/discoveryStorage.ts')
storage = storage_path.read_text()

storage = one(
    storage,
    "export type CompletedEvidence = {\n  type: 'photo' | 'video' | 'audio';\n  uri: string;\n  durationMs?: number;\n};\n",
    "export type CompletedEvidence = {\n  type: 'photo' | 'video' | 'audio';\n  uri: string;\n  durationMs?: number;\n};\n\nexport type ReviewStatus = 'pending' | 'approved';\n",
    'review status type',
)

storage = one(
    storage,
    "  evidence: CompletedEvidence;\n  completedAt: string;\n};",
    "  evidence: CompletedEvidence;\n  completedAt: string;\n  reviewStatus: ReviewStatus;\n  reviewedAt?: string;\n  editedAt?: string;\n};",
    'completed discovery review fields',
)

storage = one(
    storage,
    "    return Array.isArray(parsed) ? (parsed as CompletedDiscovery[]) : [];",
    "    return Array.isArray(parsed)\n      ? (parsed as CompletedDiscovery[]).map(item => ({\n          ...item,\n          reviewStatus: item.reviewStatus ?? 'pending',\n        }))\n      : [];",
    'load review normalization',
)

storage = one(
    storage,
    "    evidence: stableEvidence,\n    completedAt,\n  };",
    "    evidence: stableEvidence,\n    completedAt,\n    reviewStatus: 'pending',\n  };",
    'new discovery pending review',
)

storage += """

async function saveCompletedDiscoveries(items: CompletedDiscovery[]) {
  await AsyncStorage.setItem(DISCOVERIES_KEY, JSON.stringify(items));
}

export async function updateCompletedDiscovery(
  id: string,
  input: { observation: string; location: string },
) {
  const existing = await loadCompletedDiscoveries();
  let updated: CompletedDiscovery | null = null;
  const next = existing.map(item => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      observation: input.observation,
      location: input.location,
      editedAt: new Date().toISOString(),
      reviewStatus: 'pending',
      reviewedAt: undefined,
    };
    return updated;
  });

  if (!updated) throw new Error('Discovery not found.');
  await saveCompletedDiscoveries(next);
  return updated;
}

export async function approveCompletedDiscovery(id: string) {
  const existing = await loadCompletedDiscoveries();
  let updated: CompletedDiscovery | null = null;
  const next = existing.map(item => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      reviewStatus: 'approved',
      reviewedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) throw new Error('Discovery not found.');
  await saveCompletedDiscoveries(next);
  return updated;
}
"""
storage_path.write_text(storage)


# ---- native app -----------------------------------------------------------
native_path = Path('NativeApp.tsx')
text = native_path.read_text()

text = one(
    text,
    "  addCompletedDiscovery,\n  CompletedDiscovery,\n  loadCompletedDiscoveries,\n} from './src/discoveryStorage';",
    "  addCompletedDiscovery,\n  approveCompletedDiscovery,\n  CompletedDiscovery,\n  loadCompletedDiscoveries,\n  updateCompletedDiscovery,\n} from './src/discoveryStorage';",
    'discovery imports',
)

text = one(
    text,
    "  | 'complete'\n  | 'discoveries';",
    "  | 'complete'\n  | 'discoveries'\n  | 'discovery-detail'\n  | 'edit-discovery';",
    'screen types',
)

text = one(
    text,
    "type CaptureMode = 'photo' | 'video' | 'audio';",
    "type CaptureMode = 'photo' | 'video' | 'audio';\ntype MissionFilter = 'ALL' | Mission['difficulty'];\ntype MissionSort = 'LOW_TO_HIGH' | 'HIGH_TO_LOW' | 'MISSION_NO';",
    'mission ui types',
)

text = one(
    text,
    "const testMissions = missions.filter(mission => TEST_MISSION_IDS.includes(mission.id));",
    """const testMissions = missions.filter(mission => TEST_MISSION_IDS.includes(mission.id));
const difficultyRank: Record<Mission['difficulty'], number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

function getMissionOfDay() {
  const now = new Date();
  const dayKey = Number(`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`);
  return testMissions[dayKey % testMissions.length] ?? activeMission;
}""",
    'mission helpers',
)

text = one(
    text,
    "  const [discoveries, setDiscoveries] = useState<CompletedDiscovery[]>([]);\n  const [submittingDiscovery, setSubmittingDiscovery] = useState(false);",
    """  const [discoveries, setDiscoveries] = useState<CompletedDiscovery[]>([]);
  const [submittingDiscovery, setSubmittingDiscovery] = useState(false);
  const [missionFilter, setMissionFilter] = useState<MissionFilter>('ALL');
  const [missionSort, setMissionSort] = useState<MissionSort>('LOW_TO_HIGH');
  const [selectedDiscovery, setSelectedDiscovery] = useState<CompletedDiscovery | null>(null);
  const [editObservation, setEditObservation] = useState('');
  const [editLocation, setEditLocation] = useState('');""",
    'native ui states',
)

text = one(
    text,
    "    location,\n  ]);",
    "    location,\n    selectedMission.id,\n  ]);",
    'draft mission dependency',
)

text = one(
    text,
    "  const openMyDiscoveries = async () => {\n    const saved = await loadCompletedDiscoveries();\n    setDiscoveries(saved);\n    setScreen('discoveries');\n  };",
    """  const openMyDiscoveries = async () => {
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

  const chooseMissionSort = () => {
    Alert.alert('Sort missions', 'Choose an order', [
      { text: 'Difficulty: Low → High', onPress: () => setMissionSort('LOW_TO_HIGH') },
      { text: 'Difficulty: High → Low', onPress: () => setMissionSort('HIGH_TO_LOW') },
      { text: 'Mission number', onPress: () => setMissionSort('MISSION_NO') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };""",
    'discovery and sort functions',
)

text = one(
    text,
    "  const renderCapture = () => {",
    """  const missionOfDay = getMissionOfDay();
  const sortedTestMissions = [...testMissions]
    .filter(mission => missionFilter === 'ALL' || mission.difficulty === missionFilter)
    .filter(mission => mission.id !== missionOfDay.id)
    .sort((a, b) => {
      if (missionSort === 'LOW_TO_HIGH') return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      if (missionSort === 'HIGH_TO_LOW') return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
      return Number(a.number) - Number(b.number);
    });
  const sortLabel =
    missionSort === 'LOW_TO_HIGH'
      ? 'LOW → HIGH'
      : missionSort === 'HIGH_TO_LOW'
        ? 'HIGH → LOW'
        : 'MISSION NO.';

  const renderCapture = () => {""",
    'derived mission list',
)

text = one(
    text,
    """            <AppText style={styles.body}>
              Your evidence has been captured and attached to this mission entry.
            </AppText>""",
    """            <AppText style={styles.body}>
              Your evidence has been saved and sent to the prototype review state.
            </AppText>
            <View style={styles.reviewStatusCard}>
              <Ionicons name="time-outline" size={22} color={colors.blue} />
              <View style={{ flex: 1, gap: 3 }}>
                <AppText style={styles.label}>PENDING REVIEW · TITLE LOCKED</AppText>
                <AppText style={styles.smallMuted}>Approval is simulated in this prototype from the field note detail.</AppText>
              </View>
            </View>""",
    'complete review state',
)

# Insert discovery detail + edit screens before My Discoveries.
marker = "  if (screen === 'discoveries') {\n"
if text.count(marker) != 1:
    raise SystemExit('discoveries screen marker missing')
detail_block = """  if (screen === 'discovery-detail' && selectedDiscovery) {
    const approved = selectedDiscovery.reviewStatus === 'approved';
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Field note" onBack={() => setScreen('discoveries')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>FIELD NOTE · {selectedDiscovery.category}</AppText>
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
                  ? 'TITLE UNLOCKED · APPROVED DISCOVERY'
                  : 'TITLE LOCKED · APPROVAL REQUIRED'}
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
              ? 'Editing sends this discovery back to Pending Review and locks the title again.'
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

"""
text = text.replace(marker, detail_block + marker, 1)

text = one(
    text,
    """              </View>

              {earlierDiscoveries.length > 0 ? (""",
    """              </View>
              <PrimaryButton outline label="Open field note" onPress={() => openDiscoveryDetail(latestDiscovery)} />

              {earlierDiscoveries.length > 0 ? (""",
    'featured open field note',
)

text = one(
    text,
    """                        <AppText style={styles.smallMuted}>
                          {item.location ? `${item.location} · ` : ''}
                          {new Date(item.completedAt).toLocaleDateString()}
                        </AppText>
                      </View>""",
    """                        <AppText style={styles.smallMuted}>
                          {item.location ? `${item.location} · ` : ''}
                          {new Date(item.completedAt).toLocaleDateString()}
                        </AppText>
                        <Pressable onPress={() => openDiscoveryDetail(item)}>
                          <AppText style={styles.openMission}>OPEN FIELD NOTE →</AppText>
                        </Pressable>
                      </View>""",
    'earlier open field note',
)

old_home = """        <AppText style={styles.h1}>Something familiar. Something unnoticed.</AppText>
        <AppText style={styles.body}>Open one mission and investigate it your way.</AppText>
        <AppText style={styles.eyebrow}>TRY A MISSION</AppText>
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
        ))}"""
new_home = """        <AppText style={styles.h1}>Something familiar. Something unnoticed.</AppText>
        <AppText style={styles.body}>Open one mission and investigate it your way.</AppText>

        <AppText style={styles.eyebrow}>MISSION OF THE DAY</AppText>
        <Pressable
          style={[styles.missionCard, styles.todayMissionCard]}
          onPress={() => openMissionForTest(missionOfDay)}
        >
          <View style={styles.featuredMissionMeta}>
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{missionOfDay.difficulty}</AppText>
            </View>
            <AppText style={styles.archiveLabel}>TODAY'S PICK</AppText>
          </View>
          <AppText style={styles.h2}>{missionOfDay.title}</AppText>
          <AppText style={styles.body}>{missionOfDay.hook}</AppText>
          <AppText style={styles.openMission}>OPEN TODAY'S MISSION →</AppText>
        </Pressable>

        <View style={styles.exploreHeader}>
          <AppText style={styles.eyebrow}>EXPLORE MISSIONS</AppText>
          <Pressable style={styles.sortButton} onPress={chooseMissionSort}>
            <Ionicons name="swap-vertical-outline" size={17} color={colors.blue} />
            <AppText style={styles.sortButtonText}>{sortLabel}</AppText>
          </Pressable>
        </View>
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
        {sortedTestMissions.length === 0 ? (
          <View style={styles.emptyMissionFilter}>
            <AppText style={styles.body}>No other missions match this filter today.</AppText>
          </View>
        ) : (
          sortedTestMissions.map(mission => (
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
          ))
        )}"""
text = one(text, old_home, new_home, 'home filters and daily mission')

text = one(
    text,
    """  nativeNote: {
    flexDirection: 'row',""",
    """  todayMissionCard: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSubtle,
  },
  featuredMissionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exploreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
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
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterChipText: { ...typography.label, color: colors.text },
  filterChipTextActive: { color: colors.white },
  sortButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.blueSubtle,
  },
  sortButtonText: { ...typography.tiny, color: colors.blue },
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
  nativeNote: {
    flexDirection: 'row',""",
    'new styles',
)

native_path.write_text(text)
