from pathlib import Path

p = Path('NativeApp.tsx')
s = p.read_text()

if 'function MissionNumberMark(' not in s:
    marker = 'function PrimaryButton({'
    idx = s.index(marker)
    component = '''function MissionNumberMark({ number }: { number: string }) {
  return (
    <View style={styles.missionNumberMark}>
      <AppText style={styles.missionNumberWord}>MISSION</AppText>
      <View style={styles.missionNumberBlock}>
        <AppText style={styles.missionNumberDigits}>{number}</AppText>
      </View>
    </View>
  );
}

'''
    s = s[:idx] + component + s[idx:]

replacements = {
    '<AppText style={styles.missionNumberLabel}>MISSION {selectedMission.number}</AppText>': '<MissionNumberMark number={selectedMission.number} />',
    '<AppText style={styles.missionNumberLabel}>MISSION {featuredMission.number}</AppText>': '<MissionNumberMark number={featuredMission.number} />',
    '<AppText style={styles.missionNumberLabel}>MISSION {mission.number}</AppText>': '<MissionNumberMark number={mission.number} />',
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f'missing markup: {old}')
    s = s.replace(old, new)

old_styles = """  missionIdentityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  missionNumberLabel: { fontFamily: 'Archivo_600SemiBold', fontSize: 15, lineHeight: 20, color: colors.ink, letterSpacing: 0.8 },
"""
new_styles = """  missionIdentityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  missionNumberMark: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missionNumberWord: {
    ...typography.tiny,
    color: colors.muted,
    letterSpacing: 1.1,
  },
  missionNumberBlock: {
    width: 46,
    height: 38,
    borderRadius: radius.sm,
    borderTopLeftRadius: 0,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionNumberDigits: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink,
    letterSpacing: 0.4,
  },
"""
if old_styles not in s:
    raise SystemExit('mission number styles pattern not found')
s = s.replace(old_styles, new_styles, 1)

old_featured = """  todayMissionCard: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSubtle,
  },
"""
new_featured = """  todayMissionCard: {
    borderColor: colors.lime,
    backgroundColor: colors.limeSubtle,
  },
"""
if old_featured not in s:
    raise SystemExit('featured mission style pattern not found')
s = s.replace(old_featured, new_featured, 1)

p.write_text(s)
