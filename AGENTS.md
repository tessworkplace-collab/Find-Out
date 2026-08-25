# Find Out implementation rules

## Product goal
Build the Find Out mobile prototype from the approved Figma design. The prototype translates incomplete information into self-directed real-world missions.

## Core UX constraints
- Give users a question, not a prescribed destination.
- One active mission at a time.
- Core flow: Notice → Investigate → Document → Submit.
- Other discoveries stay hidden until the user submits their own discovery.
- No likes or comments in the MVP.
- Location is optional.
- Do not add recommendation/ranking mechanics that turn the product into a places app.

## Visual system
- Mobile-first, target design width 393 px.
- Archivo SemiBold for major headings.
- Inter for UI/body copy.
- Primary blue #164BFF.
- Lime accent #B9F227.
- White/light neutral editorial surfaces.
- Reuse shared Top Bar, Mission Stepper, Buttons, Mission cards, Bottom Navigation, and status patterns.
- Keep generic icons visually simple and consistent; never replace the approved Find Out mark with a different icon.

## Engineering
- Expo + React Native + TypeScript.
- Prefer small reusable React Native components over screen-specific duplicated styling.
- Keep device APIs behind components so simulated capture can later be swapped for real camera/audio implementations.
- Do not introduce backend/auth/social dependencies unless explicitly requested.
- Keep the prototype runnable in Expo Go where possible.
