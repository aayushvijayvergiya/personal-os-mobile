# Agent instructions

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## This project

- **Start with `docs/plan.md`.** It is the executable specification: decisions, themes, screen specs, and the phased build order. Follow it in order; do not reopen decided questions. Log any uncovered choice in `docs/decisions.md`.
- The Supabase backend is **frozen** and owned by the web repo. Never add migrations here.
- All colours, borders and font sizes come from the theme (`src/theme`) through the UI kit (`src/ui`). No hard-coded styling in screens.
- Route files under `app/` stay thin; screens live in `src/screens`.
- Before calling a phase done run: `npm run typecheck && npm run lint && npm test && npx expo-doctor`.
