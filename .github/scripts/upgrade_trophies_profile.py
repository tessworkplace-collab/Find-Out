from pathlib import Path

p = Path('NativeApp.tsx')
s = p.read_text()

def r(old, new, label):
    global s
    c = s.count(old)
    if c != 1:
        raise SystemExit(f'{label}: {c}')
    s = s.replace(old, new, 1)

r("""  const submitDiscovery = async () => {""",
"""  const openProfile = async () => {
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

  const submitDiscovery = async () => {""", 'profile funcs')

marker = "  if (screen === 'discoveries') {\n"
if s.count(marker) != 1:
    raise SystemExit('discoveries marker')
block = """  if (screen === 'profile') {
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

"""
s = s.replace(marker, block + marker, 1)

r("""        <Pressable style={styles.linkedEvidence} onPress={openMyDiscoveries}>
          <Ionicons name="bookmark-outline" size={26} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.label}>My Discoveries</AppText>
            <AppText style={styles.smallMuted}>Your completed field notes</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
        <View style={styles.nativeNote}>""",
"""        <Pressable style={styles.linkedEvidence} onPress={openMyDiscoveries}>
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
        <View style={styles.nativeNote}>""", 'home entry')

r("""  nativeNote: {
    flexDirection: 'row',""",
"""  profileAvatar: {
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
    flexDirection: 'row',""", 'styles')

p.write_text(s)
