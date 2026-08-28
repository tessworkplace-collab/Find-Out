from pathlib import Path

p = Path('NativeApp.tsx')
s = p.read_text()

if '  profileAvatar: {' not in s:
    marker = "  nativeNote: {\n"
    if s.count(marker) != 1:
        raise SystemExit(f'nativeNote marker: {s.count(marker)}')
    styles = """  profileAvatar: {
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
"""
    s = s.replace(marker, styles + marker, 1)

p.write_text(s)
