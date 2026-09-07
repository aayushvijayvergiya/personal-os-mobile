# Personal OS — Mobile 📱

iOS + Android companion to [Personal OS](https://github.com/aayushvijayvergiya/personal-os), the retro Windows-95-styled life OS: tasks, projects, goals, habits with streaks, daily and weekly journals, calendar, quick notes, a reading list and a vision board. Built with **Expo SDK 57 / React Native**, sharing the web app's Supabase backend unchanged.

Sign in with the same account on the phone and on the web and you see the same data.

## Status

All ten build phases from [`docs/plan.md`](docs/plan.md) are implemented: every module the web app has, three themes, and the bundled retro typeface. What remains is device QA — work through [`docs/qa-checklist.md`](docs/qa-checklist.md) on a real Android and iOS device.

## Local development

1. `npm install`
2. `cp .env.example .env` and fill in the same Supabase URL and anon key the web app uses.
3. `npx expo start` → scan the QR code with **Expo Go**, or press `a` / `i` for an emulator.
4. Sign in with your existing Personal OS account.

There is a dev-only **Kitchen Sink** screen under More → 🧪 that renders every UI component so you can check all three themes at a glance.

## Scripts

| Command | What |
|---|---|
| `npm start` | Metro dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Expo config + Prettier) |
| `npm test` | Jest (`jest-expo`) |
| `npm run format` | Prettier |
| `npm run doctor` | `expo-doctor` dependency and config check |

## Building

EAS profiles live in `eas.json`.

```bash
npx eas build --profile preview --platform android   # installable APK
npx eas build --profile preview --platform ios       # simulator build
```

## Layout

```
app/          Expo Router routes (thin re-exports of screens)
src/lib/      Pure logic ported verbatim from the web app, plus its tests
src/data/     Supabase client, TanStack Query hooks, one module per table
src/theme/    Token-based themes: Chicago (default), Luna, Slate
src/ui/       Retro UI kit — Window, Bevel, Btn, Dialog, DateField, …
src/screens/  One folder per screen
tests/        Jest tests: pure logic, UI kit, screen behaviour
docs/         plan.md, decisions.md, qa-checklist.md
```

## Design notes

- **Themes.** Every colour, border and font size comes from `src/theme`. Screens never hard-code styling. Chicago is a faithful Windows 95 port, Luna is Windows XP, Slate is a dark scheme. Each is checked for 4.5:1 text contrast by a unit test.
- **Typeface.** IBM Plex Sans (SIL Open Font License), bundled via `expo-font`, with a System option in Settings → Display. Bold swaps the SemiBold font file rather than faux-bolding.
- **Navigation.** A bottom taskbar with Home, Tasks, Journal, Habits and More. More is a nested stack holding Goals, Projects, Calendar, Notes, Reading, Vision Board and Settings.
- **Data.** TanStack Query, one hooks module per table, with a shared query-key factory so a habit ticked in the Journal updates the Dashboard and Habits screens with no manual refresh. Task and habit toggles are optimistic.

## Backend

No migrations live here. The schema is owned by the web repo (`supabase/migrations/`), and Row-Level Security scopes every row to the signed-in user.
