from pathlib import Path


def replace_one(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)

# Native: missing-evidence state and more useful microphone denial action.
p = Path('NativeApp.tsx')
s = p.read_text()

s = replace_one(
    s,
    """        Alert.alert(
          'Microphone access needed',
          'Allow microphone access to record audio evidence.',
        );""",
    """        Alert.alert(
          'Microphone access needed',
          'Allow microphone access to record audio evidence.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );""",
    'audio denied alert',
)

s = replace_one(
    s,
    """          {selectedDiscovery.evidence.type === 'photo' ? (
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
          )}""",
    """          {selectedDiscovery.evidenceMissing ? (
            <View style={styles.detailEvidencePlaceholder}>
              <Ionicons name="alert-circle-outline" size={44} color={colors.muted} />
              <AppText style={styles.h3}>Evidence unavailable</AppText>
              <AppText style={[styles.smallMuted, { textAlign: 'center' }]}>The saved media file is no longer available on this device. Your field note is still preserved.</AppText>
            </View>
          ) : selectedDiscovery.evidence.type === 'photo' ? (
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
          )}""",
    'detail missing evidence',
)

s = replace_one(
    s,
    """                  {latestDiscovery.evidence.type === 'photo' ? (
                    <Image source={{ uri: latestDiscovery.evidence.uri }} style={styles.featuredImage} />
                  ) : latestDiscovery.evidence.type === 'audio' ? (""",
    """                  {latestDiscovery.evidenceMissing ? (
                    <View style={styles.featuredVideo}>
                      <Ionicons name="alert-circle-outline" size={36} color={colors.muted} />
                      <AppText style={styles.archiveLabel}>EVIDENCE UNAVAILABLE</AppText>
                    </View>
                  ) : latestDiscovery.evidence.type === 'photo' ? (
                    <Image source={{ uri: latestDiscovery.evidence.uri }} style={styles.featuredImage} />
                  ) : latestDiscovery.evidence.type === 'audio' ? (""",
    'latest missing evidence',
)

s = replace_one(
    s,
    """                        {item.evidence.type === 'photo' ? (
                          <Image source={{ uri: item.evidence.uri }} style={styles.discoveryImage} />
                        ) : (
                          <Ionicons
                            name={item.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                            size={30}
                            color={colors.blue}
                          />
                        )}""",
    """                        {item.evidenceMissing ? (
                          <Ionicons name="alert-circle-outline" size={30} color={colors.muted} />
                        ) : item.evidence.type === 'photo' ? (
                          <Image source={{ uri: item.evidence.uri }} style={styles.discoveryImage} />
                        ) : (
                          <Ionicons
                            name={item.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                            size={30}
                            color={colors.blue}
                          />
                        )}""",
    'earlier missing evidence',
)
p.write_text(s)

# Web: remove the fixed active-mission flow and use a rotating six-mission offer set.
p = Path('App.tsx')
s = p.read_text()
s = replace_one(
    s,
    "import { activeMission, nextMission, otherDiscoveries, yourDiscovery } from './src/data';",
    "import { activeMission, missions, Mission, otherDiscoveries, yourDiscovery } from './src/data';",
    'web imports',
)
s = replace_one(
    s,
    "type CaptureMode = 'photo' | 'video' | 'audio';\n\nconst brandMark",
    "type CaptureMode = 'photo' | 'video' | 'audio';\ntype MissionFilter = 'ALL' | Mission['difficulty'];\n\nconst brandMark",
    'web filter type',
)
s = replace_one(
    s,
    """const waveformBars = [18, 30, 22, 38, 26, 46, 24, 40, 28, 34, 20, 36, 24, 30, 18];
""",
    """const waveformBars = [18, 30, 22, 38, 26, 46, 24, 40, 28, 34, 20, 36, 24, 30, 18];
const WEB_MISSION_OFFER_COUNT = 6;

function createWebMissionOffers(excludeMissionId?: string) {
  const pool = missions.filter(mission => mission.id !== excludeMissionId);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, WEB_MISSION_OFFER_COUNT);
}

let webMissionOffers = createWebMissionOffers();
let webSelectedMission = webMissionOffers[0] ?? activeMission;

function refreshWebMissionOffers(excludeMissionId?: string) {
  webMissionOffers = createWebMissionOffers(excludeMissionId);
  webSelectedMission = webMissionOffers[0] ?? activeMission;
}
""",
    'web mission helpers',
)

start = s.index("function MissionCard(")
end = s.index("function Onboarding", start)
s = s[:start] + """function MissionCard({ mission, onPress }: { mission: Mission; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.missionCard}>
      <View style={styles.pill}>
        <AppText style={styles.pillText}>{mission.difficulty}</AppText>
      </View>
      <AppText style={styles.h3}>{mission.title}</AppText>
      <AppText style={styles.smallMuted}>{mission.hook}</AppText>
      <AppText style={styles.meta}>OPEN MISSION →</AppText>
      <View style={styles.track}>
        <View style={styles.fill} />
      </View>
      <MissionNumber number={mission.number} />
    </Pressable>
  );
}

""" + s[end:]

old_discover_start = s.index("function Discover(")
old_discover_end = s.index("function MissionDetail", old_discover_start)
s = s[:old_discover_start] + """function Discover({ go }: { go: (s: Screen) => void }) {
  const [filter, setFilter] = useState<MissionFilter>('ALL');
  const featured = webMissionOffers[0] ?? activeMission;
  const filtered = webMissionOffers
    .filter(mission => mission.id !== featured.id)
    .filter(mission => filter === 'ALL' || mission.difficulty === filter);

  const chooseMission = (mission: Mission) => {
    webSelectedMission = mission;
    go('mission-detail');
  };

  return (
    <Frame nav={<BottomNav active="discover" go={go} />}>
      <TopBar title="FIND OUT" type="root" onProfile={() => go('profile')} />
      <ScrollView contentContainerStyle={styles.content}>
        <TitleBlock
          title="Something familiar. Something unnoticed."
          body="Choose from a rotating set of missions and investigate one your way."
        />
        <AppText style={styles.eyebrowBlue}>FEATURED MISSION</AppText>
        <MissionCard mission={featured} onPress={() => chooseMission(featured)} />
        <AppText style={styles.eyebrowBlue}>EXPLORE MISSIONS</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map(value => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filter,
                filter !== value && { backgroundColor: colors.white, borderColor: colors.borderStrong },
              ]}
            >
              <View style={[styles.limeDot, filter !== value && { backgroundColor: colors.borderStrong }]} />
              <AppText style={styles.label}>{value === 'ALL' ? 'All' : value[0] + value.slice(1).toLowerCase()}</AppText>
            </Pressable>
          ))}
        </ScrollView>
        {filtered.length === 0 ? (
          <AppText style={styles.smallMuted}>No other missions in this rotating set match this difficulty.</AppText>
        ) : (
          filtered.map(mission => (
            <MissionCard key={mission.id} mission={mission} onPress={() => chooseMission(mission)} />
          ))
        )}
      </ScrollView>
    </Frame>
  );
}

""" + s[old_discover_end:]

# All mission-flow content now follows the one selected mission instead of a fixed fallback.
s = s.replace('activeMission.', 'webSelectedMission.')

# Mission detail: accepted evidence and optional safety note.
s = replace_one(
    s,
    """        <TitleBlock title={webSelectedMission.title} body={webSelectedMission.summary} />
        <Stepper stage="Notice" />""",
    """        <TitleBlock title={webSelectedMission.title} body={webSelectedMission.summary} />
        <View style={styles.info}>
          <Ionicons name="document-attach-outline" size={20} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.guidanceTitle}>Accepted evidence</AppText>
            <AppText style={styles.guidanceBody}>
              {webSelectedMission.acceptedEvidence.map(type => type[0].toUpperCase() + type.slice(1)).join(' · ')}
            </AppText>
            <AppText style={styles.helper}>Short finding required</AppText>
          </View>
        </View>
        {webSelectedMission.safetyNote ? (
          <View style={styles.info}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.guidanceTitle}>Explore safely</AppText>
              <AppText style={styles.guidanceBody}>{webSelectedMission.safetyNote}</AppText>
            </View>
          </View>
        ) : null}
        <Stepper stage="Notice" />""",
    'web mission requirements',
)

# Only show evidence formats accepted by the mission.
s = replace_one(
    s,
    """          {captureOptions.map(({ mode, icon, label }) => (""",
    """          {captureOptions
            .filter(({ mode }) => webSelectedMission.acceptedEvidence.includes(mode))
            .map(({ mode, icon, label }) => (""",
    'web evidence filter',
)

s = s.replace('FIELD NOTE · 03', 'FIELD NOTE · MISSION {webSelectedMission.number}')

# Completion rotates offers and excludes the just-completed mission.
s = replace_one(
    s,
    """        <Button outline label="Explore another mission" onPress={() => go('discover')} />""",
    """        <Button
          outline
          label="Explore another mission"
          onPress={() => {
            refreshWebMissionOffers(webSelectedMission.id);
            go('discover');
          }}
        />""",
    'web completion rotation',
)

# Stale sound-specific reveal copy becomes same-mission dynamic copy.
s = s.replace('A SOUND YOU KNOW  ·  SAME MISSION', '{webSelectedMission.title.toUpperCase()}  ·  SAME MISSION')
s = s.replace('A SOUND YOU KNOW', '{webSelectedMission.title.toUpperCase()}')

p.write_text(s)
