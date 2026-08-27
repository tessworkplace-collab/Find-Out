from pathlib import Path

path = Path('NativeApp.tsx')
text = path.read_text()

old = '''  if (screen === 'discoveries') {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="My Discoveries" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>MY DISCOVERIES</AppText>
          <AppText style={styles.h1}>What you have noticed</AppText>
          <AppText style={styles.body}>
            Completed field notes are saved on this device.
          </AppText>

          {discoveries.length === 0 ? (
            <View style={styles.questionCard}>
              <AppText style={styles.h3}>No completed discoveries yet</AppText>
              <AppText style={styles.body}>Finish a mission and it will appear here.</AppText>
            </View>
          ) : (
            discoveries.map(item => (
              <View key={item.id} style={styles.discoveryCard}>
                <View style={styles.discoveryMedia}>
                  {item.evidence.type === 'photo' ? (
                    <Image source={{ uri: item.evidence.uri }} style={styles.discoveryImage} />
                  ) : (
                    <Ionicons
                      name={item.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                      size={30}
                      color={colors.blue}
                    />
                  )}
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <AppText style={styles.eyebrow}>{item.category}</AppText>
                  <AppText style={styles.h3}>{item.missionTitle}</AppText>
                  <AppText style={styles.body}>{item.observation}</AppText>
                  <AppText style={styles.smallMuted}>
                    {item.location ? `${item.location} · ` : ''}
                    {new Date(item.completedAt).toLocaleDateString()}
                  </AppText>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
'''

new = '''  if (screen === 'discoveries') {
    const latestDiscovery = discoveries[0];
    const earlierDiscoveries = discoveries.slice(1);

    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="My Discoveries" onBack={() => setScreen('discover')} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText style={styles.eyebrow}>MY DISCOVERIES</AppText>
          <AppText style={styles.h1}>What caught your attention.</AppText>
          <AppText style={styles.body}>A record of the things you chose to notice.</AppText>

          <View style={styles.archiveSummary}>
            <View>
              <AppText style={styles.archiveCount}>{discoveries.length.toString().padStart(2, '0')}</AppText>
              <AppText style={styles.archiveLabel}>
                {discoveries.length === 1 ? 'DISCOVERY' : 'DISCOVERIES'}
              </AppText>
            </View>
            <View style={styles.archiveSavedRow}>
              <View style={styles.archiveDot} />
              <AppText style={styles.smallMuted}>SAVED ON THIS DEVICE</AppText>
            </View>
          </View>

          {discoveries.length === 0 ? (
            <View style={styles.emptyJournalCard}>
              <Ionicons name="bookmark-outline" size={30} color={colors.blue} />
              <AppText style={styles.h3}>Your field journal starts here</AppText>
              <AppText style={styles.body}>Finish a mission and your first discovery will appear here.</AppText>
            </View>
          ) : latestDiscovery ? (
            <>
              <AppText style={styles.sectionLabel}>LATEST DISCOVERY</AppText>
              <View style={styles.featuredDiscovery}>
                <View style={styles.featuredMedia}>
                  {latestDiscovery.evidence.type === 'photo' ? (
                    <Image source={{ uri: latestDiscovery.evidence.uri }} style={styles.featuredImage} />
                  ) : latestDiscovery.evidence.type === 'audio' ? (
                    <View style={styles.featuredAudio}>
                      <Ionicons name="mic-outline" size={34} color={colors.blue} />
                      <View style={styles.featuredWaveform}>
                        {[24, 48, 34, 70, 42, 58, 30, 64, 38, 52, 28].map((height, index) => (
                          <View key={index} style={[styles.featuredWaveBar, { height }]} />
                        ))}
                      </View>
                      <AppText style={styles.archiveLabel}>AUDIO EVIDENCE</AppText>
                    </View>
                  ) : (
                    <View style={styles.featuredVideo}>
                      <View style={styles.videoBadge}>
                        <Ionicons name="videocam-outline" size={34} color={colors.blue} />
                      </View>
                      <AppText style={styles.archiveLabel}>VIDEO EVIDENCE</AppText>
                    </View>
                  )}
                </View>

                <View style={styles.featuredBody}>
                  <View style={styles.featuredMetaRow}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{latestDiscovery.category}</AppText>
                    </View>
                    <AppText style={styles.discoveryNumber}>01</AppText>
                  </View>
                  <AppText style={styles.h2}>{latestDiscovery.missionTitle}</AppText>
                  <AppText style={styles.featuredObservation}>{latestDiscovery.observation}</AppText>
                  <View style={styles.featuredFooter}>
                    <AppText style={styles.smallMuted}>{latestDiscovery.location || 'Location not added'}</AppText>
                    <AppText style={styles.smallMuted}>{new Date(latestDiscovery.completedAt).toLocaleDateString()}</AppText>
                  </View>
                  <View style={styles.fieldNoteStamp}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.blue} />
                    <AppText style={styles.archiveLabel}>FIELD NOTE · SAVED</AppText>
                  </View>
                </View>
              </View>

              {earlierDiscoveries.length > 0 ? (
                <>
                  <AppText style={styles.sectionLabel}>EARLIER DISCOVERIES</AppText>
                  {earlierDiscoveries.map((item, index) => (
                    <View key={item.id} style={styles.discoveryCard}>
                      <View style={styles.discoveryMedia}>
                        {item.evidence.type === 'photo' ? (
                          <Image source={{ uri: item.evidence.uri }} style={styles.discoveryImage} />
                        ) : (
                          <Ionicons
                            name={item.evidence.type === 'video' ? 'videocam-outline' : 'mic-outline'}
                            size={30}
                            color={colors.blue}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1, gap: 5 }}>
                        <View style={styles.earlierMetaRow}>
                          <AppText style={styles.eyebrow}>{item.category}</AppText>
                          <AppText style={styles.smallMuted}>{(index + 2).toString().padStart(2, '0')}</AppText>
                        </View>
                        <AppText style={styles.h3}>{item.missionTitle}</AppText>
                        <AppText style={styles.body}>{item.observation}</AppText>
                        <AppText style={styles.smallMuted}>
                          {item.location ? `${item.location} · ` : ''}
                          {new Date(item.completedAt).toLocaleDateString()}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }
'''

if text.count(old) != 1:
    raise SystemExit(f'discoveries block: expected 1 match, found {text.count(old)}')
text = text.replace(old, new, 1)

old_styles = '''  completeWrap: { alignItems: 'center', gap: 18, paddingTop: 60 },
  discoveryCard: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.white,
  },
  discoveryMedia: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.blueSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  successCircle: {'''

new_styles = '''  completeWrap: { alignItems: 'center', gap: 18, paddingTop: 60 },
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
  successCircle: {'''

if text.count(old_styles) != 1:
    raise SystemExit(f'discovery styles: expected 1 match, found {text.count(old_styles)}')
text = text.replace(old_styles, new_styles, 1)

path.write_text(text)
