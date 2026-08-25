# Find Out — React Native / Expo prototype

This repository contains the first coded implementation of the approved **Find Out** Figma prototype.

## Stack

- React Native + Expo SDK 54
- TypeScript
- Archivo + Inter via `@expo-google-fonts`
- `@expo/vector-icons` for generic interface glyphs
- Approved Find Out brand mark exported from the Figma component and embedded as an exact data-URI asset

## Run

```bash
npm install
npx expo install --fix
npx expo start
```

Then open the project with Expo Go, or press `a`, `i`, or `w` in the Expo terminal UI.

## Implemented flow

Onboarding → Discover → Mission Detail → Investigate → Capture Evidence → simulated Photo/Video/Audio capture → Document → Mission Complete → Other Discoveries → Discovery Detail.

Secondary navigation also includes My Discoveries, Profile, Trophies, Evidence Detail, and Share Discovery.

## Current implementation boundary

The UI and interaction flow are functional. Photo/video/audio capture is currently a **prototype simulation** that reproduces the designed capture states without requesting real device camera/microphone APIs. This keeps the first build stable for interface/user-flow testing. The next implementation pass can replace the simulated capture screen with `expo-camera` and `expo-audio` while keeping the same UI structure.

## Figma source

Figma file: `EZZCBQtCApwm3godyFNumS`

Primary design width: 393 px.

Core tokens:

- Primary: `#164BFF`
- Secondary/lime: `#B9F227`
- Primary subtle: `#F4F7FF`
- Secondary subtle: `#F6FCE8`
- Ink: `#111318`
- Neutral 700: `#343842`
- Neutral 500: `#737A86`
- Neutral 300: `#C9CED6`
- Neutral 100: `#EEF0F3`
- Radius: 8 / 12 / 16 / full

## Project structure

- `App.tsx` — state-driven prototype navigation + screens
- `src/theme.ts` — design tokens and type styles
- `src/data.ts` — mission/discovery prototype data
- `src/brand.ts` — exact approved Find Out mark as an embedded asset
- `AGENTS.md` — product and engineering constraints for future Codex work
