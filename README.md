# Find Out — React Native / Expo prototype

This repository contains the first coded implementation of the approved **Find Out** Figma prototype.

## Live web preview

GitHub Pages URL (after the one-time Pages setting is enabled):

**https://tessworkplace-collab.github.io/Find-Out/**

Automatic deployment is configured in `.github/workflows/pages.yml`. Pushes to `main` and `feat/initial-expo-prototype` export the Expo web build and deploy `dist` to GitHub Pages.

One-time repository setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

## Fastest development preview

### Option A — GitHub Codespaces

Open a Codespace on the prototype branch:

[Open Find Out in Codespaces](https://codespaces.new/tessworkplace-collab/Find-Out?quickstart=1&ref=feat%2Finitial-expo-prototype)

The Codespace installs dependencies automatically and exposes the Expo web preview on port **8081**. If the preview does not open automatically, run `npm run web`, then open the forwarded `8081` URL from the **Ports** tab.

### Option B — Run locally with Expo

```bash
npm install
npx expo install --fix
npx expo start
```

Then open the project with Expo Go, or press `a`, `i`, or `w` in the Expo terminal UI.

## Stack

- React Native + Expo SDK 54
- TypeScript
- Archivo + Inter via `@expo-google-fonts`
- `@expo/vector-icons` for generic interface glyphs
- Approved Find Out brand mark exported from the Figma component and embedded as an exact data-URI asset
- Expo web support for browser preview

## Implemented flow

Onboarding → Discover → Mission Detail → Investigate → Capture Evidence → simulated Photo/Video/Audio capture → Document → Mission Complete → Other Discoveries → Discovery Detail.

Secondary navigation also includes My Discoveries, Profile, Trophies, Evidence Detail, and Share Discovery.

## Current implementation boundary

The UI and interaction flow are functional. Photo/video/audio capture is currently a **prototype simulation** that reproduces the designed capture states without requesting real device camera/microphone APIs. This keeps the first build stable for interface/user-flow testing. The next implementation pass can replace the simulated capture screen with `expo-camera` and `expo-audio` while keeping the same UI structure.

## Automated checks and deployment

- **Expo web check** installs dependencies and exports the web build on pushes and pull requests.
- **Deploy Expo Web to GitHub Pages** exports the production web app, uploads the `dist` artifact, and deploys it to GitHub Pages.
- Expo is configured with `experiments.baseUrl: "/Find-Out"` so generated assets work from the repository subpath used by GitHub Pages.

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
- `.devcontainer/devcontainer.json` — Codespaces preview setup
- `.github/workflows/web-check.yml` — Expo web export check
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment
- `AGENTS.md` — product and engineering constraints for future Codex work
