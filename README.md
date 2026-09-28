# Find Out — Expo app

Find Out is a question-led, real-world discovery app built with Expo and React Native. The app is developed for iOS and Android; the browser preview and GitHub Pages deployment have been removed.

## Run on an iPhone with Expo Go

```bash
npm ci
npx expo start --tunnel --go --clear --port 8082
```

Scan the QR code with Expo Go. Keep the terminal and Codespace running while testing. If the tunnel fails, stop any older Expo session and retry the command.

## Checks

```bash
npm run typecheck
```

The `Expo native typecheck` GitHub Action runs on pull requests and updates to `main`.

## Product flow

Choose a mission from the deck, investigate in person, capture evidence and submit an observation. Community discoveries for the same mission appear after submission. The mission pool, trophies, profile and local draft storage share the native app flow.

The approved design source is Figma file `EZZCBQtCApwm3godyFNumS`; the target mobile design width is 393 px. Product and implementation constraints live in `AGENTS.md`.
