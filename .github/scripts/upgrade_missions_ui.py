from pathlib import Path

p = Path('NativeApp.tsx')
s = p.read_text()

def r(old, new, label):
    global s
    c = s.count(old)
    if c != 1:
        raise SystemExit(f'{label}: {c}')
    s = s.replace(old, new, 1)

for spaces in (14, 18):
    indent = ' ' * spaces
    choices = "{([\n" + indent + "['photo', 'camera-outline', 'Photo'],\n" + indent + "['video', 'videocam-outline', 'Video'],\n" + indent + "['audio', 'mic-outline', 'Audio'],\n" + (' ' * (spaces - 2)) + "] as const).map(([mode, icon, label]) => ("
    filtered = "{captureChoices\n" + (' ' * (spaces - 2)) + ".filter(([mode]) => selectedMission.acceptedEvidence.includes(mode))\n" + (' ' * (spaces - 2)) + ".map(([mode, icon, label]) => ("
    if s.count(choices) != 1:
        raise SystemExit(f'capture choices {spaces}: {s.count(choices)}')
    s = s.replace(choices, filtered, 1)

r("""          <AppText style={styles.h1}>{selectedMission.title}</AppText>
          <AppText style={styles.body}>{selectedMission.summary}</AppText>
          <Stepper active={0} maxStep={highestStep} onStepPress={goToStep} />""",
"""          <AppText style={styles.h1}>{selectedMission.title}</AppText>
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
          <Stepper active={0} maxStep={highestStep} onStepPress={goToStep} />""", 'requirements')

r("""          <View style={styles.guidanceCard}>
            <AppText style={styles.label}>Keep investigating</AppText>
            <AppText style={styles.body}>{selectedMission.guidance}</AppText>
          </View>
          {!captureOptionsVisible ? (""",
"""          <View style={styles.guidanceCard}>
            <AppText style={styles.label}>Keep investigating</AppText>
            <AppText style={styles.body}>{selectedMission.guidance}</AppText>
          </View>
          {selectedMission.safetyNote ? (
            <View style={styles.safetyCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
              <AppText style={[styles.smallMuted, { flex: 1 }]}>{selectedMission.safetyNote}</AppText>
            </View>
          ) : null}
          {!captureOptionsVisible ? (""", 'investigate safety')

r("""            <View style={styles.reviewStatusCard}>
              <Ionicons name="time-outline" size={22} color={colors.blue} />
              <View style={{ flex: 1, gap: 3 }}>
                <AppText style={styles.label}>PENDING REVIEW · TITLE LOCKED</AppText>
                <AppText style={styles.smallMuted}>Approval is simulated in this prototype from the field note detail.</AppText>
              </View>
            </View>
            {evidence ? (""",
"""            <View style={styles.reviewStatusCard}>
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
            {evidence ? (""", 'unlock UI')

s = s.replace("'TITLE UNLOCKED · APPROVED DISCOVERY'", "'APPROVED DISCOVERY'")
s = s.replace("'TITLE LOCKED · APPROVAL REQUIRED'", "'DISCOVERY APPROVAL REQUIRED'")
s = s.replace("'Editing sends this discovery back to Pending Review and locks the title again.'", "'Editing sends this discovery back to Pending Review.'")

r("""  nativeNote: {
    flexDirection: 'row',""",
"""  missionRequirements: {
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
  nativeNote: {
    flexDirection: 'row',""", 'styles')

p.write_text(s)
