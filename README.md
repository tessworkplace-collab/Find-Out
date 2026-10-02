# Find Out — Native Expo prototype

Find Out is a question-first, real-world discovery prototype built with **Expo SDK 57**, React Native and TypeScript. Rather than recommending a place, it gives the user a deliberately incomplete prompt and asks them to investigate their own surroundings.

The project is designed for **iOS and Android through Expo Go**. Browser preview and GitHub Pages deployment have intentionally been removed so the prototype can focus on the native capture and permission experience.

## What is implemented

- **24 missions** across Easy, Medium and Hard difficulty, generated as a five-card Mission Deck with two refreshes and no repeated cards in a session.
- A complete journey: **Onboarding → Mission Deck → Notice → Investigate → Capture → Document → Submit → Community discoveries**.
- Native **photo, video and audio** evidence capture, including camera, microphone and photo-library permissions.
- Optional GPS location with readable nearby place-name suggestions; precise coordinates are not displayed to other users.
- Local draft recovery and saved personal discoveries, including the selected evidence file.
- Profile preferences, trophies, title selection and Mission Remix for return engagement.
- A shared, mission-specific discovery feed: other responses are revealed only after the user submits their own observation.

## Run on an iPhone with Expo Go

Requirements: current Expo Go, Node.js 22 and an active Codespace or local terminal.

```bash
npm ci
npx expo start --tunnel --go --clear --port 8082
```

Scan the QR code using Expo Go. Keep the terminal and Codespace running while testing.

If the tunnel cannot start, stop any older Expo session and run the same command again. You can still use a local network connection when the phone and development machine are on the same Wi-Fi.

## Test checklist

Before a user test or demo, complete one full path on a physical iPhone:

1. Select a Mission Deck card and begin the mission.
2. Capture one item of evidence, then add an observation.
3. Test **Use current location** and, separately, deny the location permission.
4. Submit, confirm the saved discovery appears, then open the unlocked community responses.
5. Relaunch the app partway through a mission to confirm the draft restores.

Also test denied camera and microphone permissions. The app should provide a clear fallback rather than blocking the rest of the mission.

## Data and privacy boundary

Discoveries, drafts, profile preferences and trophies are stored on the device. When a discovery is submitted, only the mission title, written observation, optional place label and chosen profile name are published to the shared community feed. Evidence media and precise GPS coordinates remain on the device.

The community feed is a prototype service for user testing, not a moderated public platform. It deliberately has no login, likes, comments, ranking or recommendation system: these would work against Find Out's question-first exploration model.

## Checks

```bash
npm run typecheck
```

The **Expo native typecheck** GitHub Action runs on every pull request and on updates to `main`.

## Design system and project structure

- Approved Figma source: `EZZCBQtCApwm3godyFNumS`
- Target mobile width: **393 px**
- Typography: **Archivo** for headings and **Inter** for interface/body copy
- Primary blue: `#164BFF`; lime accent: `#B9F227`
- `NativeApp.tsx` — application flow, capture permissions and screen state
- `src/missions.ts` — mission pool and evidence rules
- `src/missionPlay.ts` — deck, refresh and remix logic
- `src/discoveryStorage.ts` / `src/draftStorage.ts` — on-device persistence
- `src/communityDiscoveries.ts` — shared discovery publication and recovery
- `src/trophySystem.ts` — trophies and title state
- `AGENTS.md` — product and implementation constraints
