from pathlib import Path

path = Path('NativeApp.tsx')
text = path.read_text()


def one(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)

one("type MissionSort = 'LOW_TO_HIGH' | 'HIGH_TO_LOW' | 'MISSION_NO';\n", "", 'remove sort type')
one("const difficultyRank: Record<Mission['difficulty'], number> = { EASY: 0, MEDIUM: 1, HARD: 2 };\n", "", 'remove difficulty rank')
one(
    "function getMissionOfDay() {\n  const now = new Date();\n  const dayKey = Number(`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`);\n  return testMissions[dayKey % testMissions.length] ?? activeMission;\n}\n",
    "function getMissionOfDay() {\n  const now = new Date();\n  const dayKey = Number(`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`);\n  return testMissions[dayKey % testMissions.length] ?? activeMission;\n}\n\nfunction missionNumberFor(missionId: string) {\n  return missions.find(mission => mission.id === missionId)?.number ?? '--';\n}\n",
    'mission number helper',
)
one("  const [missionSort, setMissionSort] = useState<MissionSort>('LOW_TO_HIGH');\n", "", 'remove sort state')
one(
    "  const chooseMissionSort = () => {\n    Alert.alert('Sort missions', 'Choose an order', [\n      { text: 'Difficulty: Low → High', onPress: () => setMissionSort('LOW_TO_HIGH') },\n      { text: 'Difficulty: High → Low', onPress: () => setMissionSort('HIGH_TO_LOW') },\n      { text: 'Mission number', onPress: () => setMissionSort('MISSION_NO') },\n      { text: 'Cancel', style: 'cancel' },\n    ]);\n  };\n\n",
    "",
    'remove sort chooser',
)
one(
    "  const missionOfDay = getMissionOfDay();\n  const sortedTestMissions = [...testMissions]\n    .filter(mission => missionFilter === 'ALL' || mission.difficulty === missionFilter)\n    .filter(mission => mission.id !== missionOfDay.id)\n    .sort((a, b) => {\n      if (missionSort === 'LOW_TO_HIGH') return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];\n      if (missionSort === 'HIGH_TO_LOW') return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];\n      return Number(a.number) - Number(b.number);\n    });\n  const sortLabel =\n    missionSort === 'LOW_TO_HIGH'\n      ? 'LOW → HIGH'\n      : missionSort === 'HIGH_TO_LOW'\n        ? 'HIGH → LOW'\n        : 'MISSION NO.';\n",
    "  const missionOfDay = getMissionOfDay();\n  const filteredTestMissions = testMissions\n    .filter(mission => missionFilter === 'ALL' || mission.difficulty === missionFilter)\n    .filter(mission => mission.id !== missionOfDay.id);\n",
    'simplify mission list',
)
one(
    "          <AppText style={styles.eyebrow}>FIELD NOTE · 03</AppText>",
    "          <AppText style={styles.eyebrow}>FIELD NOTE · MISSION {selectedMission.number}</AppText>",
    'document mission number',
)
one(
    "          <AppText style={styles.eyebrow}>FIELD NOTE · {selectedDiscovery.category}</AppText>",
    "          <AppText style={styles.eyebrow}>FIELD NOTE · MISSION {missionNumberFor(selectedDiscovery.missionId)} · {selectedDiscovery.category}</AppText>",
    'detail mission number',
)
one(
    "                    <AppText style={styles.discoveryNumber}>01</AppText>",
    "                    <AppText style={styles.discoveryNumber}>MISSION {missionNumberFor(latestDiscovery.missionId)}</AppText>",
    'featured discovery mission number',
)
one(
    "                          <AppText style={styles.smallMuted}>{(index + 2).toString().padStart(2, '0')}</AppText>",
    "                          <AppText style={styles.smallMuted}>MISSION {missionNumberFor(item.missionId)}</AppText>",
    'earlier discovery mission number',
)
one(
    "        <ScrollView contentContainerStyle={styles.content}>\n          <View style={styles.badge}>\n            <AppText style={styles.badgeText}>{selectedMission.difficulty}</AppText>\n          </View>\n          <AppText style={styles.h1}>{selectedMission.title}</AppText>",
    "        <ScrollView contentContainerStyle={styles.content}>\n          <View style={styles.missionIdentityRow}>\n            <AppText style={styles.missionNumberLabel}>MISSION {selectedMission.number}</AppText>\n            <View style={styles.badge}>\n              <AppText style={styles.badgeText}>{selectedMission.difficulty}</AppText>\n            </View>\n          </View>\n          <AppText style={styles.h1}>{selectedMission.title}</AppText>",
    'mission detail identity',
)
one(
    "          <View style={styles.featuredMissionMeta}>\n            <View style={styles.badge}>\n              <AppText style={styles.badgeText}>{missionOfDay.difficulty}</AppText>\n            </View>\n            <AppText style={styles.archiveLabel}>TODAY'S PICK</AppText>\n          </View>",
    "          <View style={styles.featuredMissionMeta}>\n            <View style={{ gap: 5 }}>\n              <AppText style={styles.missionNumberLabel}>MISSION {missionOfDay.number}</AppText>\n              <AppText style={styles.archiveLabel}>TODAY'S PICK</AppText>\n            </View>\n            <View style={styles.badge}>\n              <AppText style={styles.badgeText}>{missionOfDay.difficulty}</AppText>\n            </View>\n          </View>",
    'today identity',
)
one(
    "        <View style={styles.exploreHeader}>\n          <AppText style={styles.eyebrow}>EXPLORE MISSIONS</AppText>\n          <Pressable style={styles.sortButton} onPress={chooseMissionSort}>\n            <Ionicons name=\"swap-vertical-outline\" size={17} color={colors.blue} />\n            <AppText style={styles.sortButtonText}>{sortLabel}</AppText>\n          </Pressable>\n        </View>",
    "        <AppText style={styles.eyebrow}>EXPLORE MISSIONS</AppText>",
    'remove sort ui',
)
text = text.replace('sortedTestMissions.length', 'filteredTestMissions.length')
text = text.replace('sortedTestMissions.map', 'filteredTestMissions.map')
one(
    "              <View style={styles.badge}>\n                <AppText style={styles.badgeText}>{mission.difficulty}</AppText>\n              </View>\n              <AppText style={styles.h3}>{mission.title}</AppText>",
    "              <View style={styles.missionIdentityRow}>\n                <AppText style={styles.missionNumberLabel}>MISSION {mission.number}</AppText>\n                <View style={styles.badge}>\n                  <AppText style={styles.badgeText}>{mission.difficulty}</AppText>\n                </View>\n              </View>\n              <AppText style={styles.h3}>{mission.title}</AppText>",
    'mission card identity',
)
one(
    "  featuredMissionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },\n  exploreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },",
    "  featuredMissionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },\n  missionIdentityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },\n  missionNumberLabel: { fontFamily: 'Archivo_600SemiBold', fontSize: 15, lineHeight: 20, color: colors.ink, letterSpacing: 0.8 },",
    'identity styles',
)
one(
    "  sortButton: {\n    minHeight: 38,\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 5,\n    paddingHorizontal: 12,\n    borderRadius: radius.full,\n    backgroundColor: colors.blueSubtle,\n  },\n  sortButtonText: { ...typography.tiny, color: colors.blue },\n",
    "",
    'remove sort styles',
)

path.write_text(text)
