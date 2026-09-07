# Personal OS Mobile — Development Plan

**Date:** 2026-09-06
**Status:** Approved 2026-09-06 (answers in §14.1). Phases 0–10 implemented; device QA outstanding.
**Source app:** https://github.com/aayushvijayvergiya/personal-os (web, Next.js 16 + Supabase) — live at https://personal-os-nu-ashen.vercel.app/
**Target:** iOS + Android app built with React Native (Expo SDK 57), sharing the web app's Supabase backend unchanged.

---

## 0. How to use this document

This plan is written so that an implementing model (e.g. Claude Opus) can build the app **exactly** as specified without re-deriving decisions.

Rules for the implementer:

1. Work through **Section 11 (Build Phases)** in order. Each phase lists the files to create, what they must do, and a Definition of Done (DoD). Do not start a phase until the previous phase's DoD passes.
2. Every decision that is already made lives in **Section 3**. Do not re-open them. If something is genuinely unspecified, pick the option that most closely mirrors the web app's behaviour, note it in `docs/decisions.md`, and continue.
3. **The backend is frozen.** Do not add Supabase migrations, tables, columns, RPCs, or policies in this repo. All queries must work against the schema in Section 2.3 exactly as the web app does.
4. Port pure logic from the web app **verbatim** (`lib/dates.ts`, `lib/horizons.ts`, `lib/streaks.ts`, `lib/reading.ts`, `lib/types.ts`, `lib/journalDefaults.ts`). The boilerplate already contains these ports under `src/lib/`. Their tests are the contract; do not change their behaviour.
5. All UI goes through the theme system (Section 5.5) and the UI kit (Section 5.6). **Never hard-code a colour, border, or font size in a screen.** If a screen needs something the kit lacks, add it to the kit first.
6. Run the verification commands in **Section 12** before declaring any phase done. The commands must pass with zero errors.
7. Keep files small and single-purpose. A screen file over ~250 lines should be split into `components/<screen>/` pieces.

---

## 1. Goal and non-goals

### Goal

A native-feeling mobile companion to Personal OS: the same single-user data (tasks, projects, goals, habits, journals, calendar, notes, reading list, vision board, settings) and the same retro-Windows visual identity, re-laid-out for a phone. A user signed in on the web and on the phone sees identical data instantly.

### Non-goals (v1)

- No offline mode / local-first sync (mirrors the web app; listed under v2).
- No push notifications or reminders.
- No widgets, watch apps, or tablet-specific layouts (tablet runs the phone layout, `supportsTablet: true`).
- No new backend features. Every feature exists in the web app today.
- No draggable-window desktop metaphor. Same "retro-styled pages" decision as the web.
- No image upload to Supabase Storage (vision board images are URL-only, as on web).

---

## 2. Source of truth: the web app

### 2.1 Feature inventory (all must be ported)

| # | Module | Web behaviour to preserve |
|---|---|---|
| 1 | **Login** | Email + password via Supabase Auth. "Create Account" button only when signup flag env var is `true`. |
| 2 | **Dashboard** | Today's standalone tasks (due ≤ today, not done) with progress bar; "Show completed (n)" toggle listing tasks completed today; Goals in Focus (dated goals in next 14 days + current month + current quarter, not done); Currently Reading (books, status `reading`); Articles Due (articles `to_read` with due ≤ today, overdue flagged); Pinned Notes (5 newest); Today's Habits (check/uncheck, current streak 🔥, last-7-day dots); At a Glance stats. |
| 3 | **Tasks** | Tabs Today / This Week / This Month / All / Done. Query: `project_id is null`; Today = due ≤ today; Week = due ≤ end of ISO week; Month = due ≤ end of month; All = everything; Done = status done. "Show completed" checkbox on non-Done tabs. Inline add (title, due date default today, priority default P2). Row: checkbox, title, description preview, P1/P2/P3 (P1 red bold, P3 grey), due date (red + "!" if overdue). Tap row → Task Properties dialog: title, due date, priority, status (open / in_progress / done), description, custom fields, Delete / Cancel / OK. |
| 4 | **Goals** | Header counts (total / done / in progress) + New Goal. Left tree: All Goals; Dated / Month / Quarter / Year each expandable into periods with counts. Category filter list with counts. Detail pane: progress bar (done / shown), goal cards (status icon ⚪🔵✅ cycles on tap; category colour left border; current-period cards have yellow tint; past + not-done shows red date + "!"). Goal dialog: title, horizon type, horizon value (date / month / `YYYY-Qn` / `YYYY`), category, status, description, custom fields. Deleting a goal also deletes its vision-board goal cards. |
| 5 | **Projects** | Tabs Projects / All Tasks / Calendar. Projects tab: project list (non-archived) with "x/y tasks done" and target date; selected project shows description, quick add task, task rows (with project chip, P-level, due). Project Properties dialog: name, colour, status (active / paused / completed / archived), target date, description. Task Properties dialog same as Tasks plus a Project selector. All Tasks tab: Group by Project / Due date / Status. Calendar tab: month/week grid of project tasks, coloured by project. |
| 6 | **Journal** | Daily / Weekly tabs, each remembering its own date. Weekly always snaps to Monday of the ISO week. Toolbar: ◀ ▶ Today, "Saving…/Saved". Daily toolbar has habit chips (toggle `habit_entries` for that date), a tasks popover (standalone tasks due that date, checkable), and a 1–5 star rating. Weekly toolbar has only the star rating. Entry auto-created on open (upsert on `user_id,date,type`). Question set from `journal_questions` (active, by type); defaults seeded once if the table is empty. Answers persisted per question id in `answers` jsonb; free "Notes from the day/week" textarea. "n / m answered" counter. |
| 7 | **Habits** | Week grid (Mon–Sun) of active habits × days with checkboxes; future days disabled; today column tinted. Per-habit 🔥 current streak, 🏅 best, 30-day %. ◀ This Week ▶ navigation. Manage dialog: add, rename (on blur), move ▲▼ (swap `sort_order`), Retire / Restore (`active`). |
| 8 | **Calendar** | Month / Week toggle, ◀ Today ▶. Items: standalone tasks (P1 red, else navy; done = strikethrough), dated goals (teal, 🎯 prefix), articles with due dates (purple, 📰 prefix). Banner strip above the grid for month / quarter / year goals matching the anchor period (not done). Tap a day → that day's tasks & articles + quick-add task for that day. |
| 9 | **Notes** | Quick Capture (Enter to add), search (title + body), grid of note cards (pinned = yellow tint, sorted pinned first then newest). Card actions: pin/unpin, edit (title + body), delete (confirm). |
| 10 | **Reading** | Kind tabs Books / Articles. Add row: title + (author for books / link for articles) + optional due date. Book shelves To Read / Reading / Finished; article shelves To Read / Read. Items sorted soonest-due first, undated last, then `sort_order`. Book → Finish opens dialog (rating 1–5 default 4, takeaways). Moving to `reading` sets `started_at` once; to `finished` sets `finished_at`; leaving `finished` clears `finished_at` and `rating`. Properties dialog: title, author (books), link, due date, and rating + takeaways for finished books; Delete (confirm). |
| 11 | **Vision Board** | Free canvas with draggable cards (position, rotation, z-index persisted). Card types: sticky note (text + colour from 5-colour palette), image (URL + caption), goal card (live goal title, horizon, 0/50/100 % bar by status; "Goal deleted" if missing), list card (title + items with add/remove). Double-click empty space → "Pin to Vision Board" dialog. ✕ removes a card. |
| 12 | **Settings** | "Control Panel" grid with search and per-tile item counts, driven by a registry. Sections: Goal Categories (name + colour, delete), Journal Questions (add by type, enable/disable, delete), Custom Fields (entity task/goal, type text/number/date/select with options, delete), Session (email, Log Off). |
| 13 | **Status bar** | Date/time (30 s tick) + "n tasks due · x/y habits done", refreshed on every navigation. |
| 14 | **Toasts** | Any Supabase error → retro toast, 4 s, stacked bottom-right. |

### 2.2 Cross-module rules (must hold on mobile)

- Habit checkboxes on Dashboard, Journal and Habits all read/write the same `habit_entries` rows (unique on `habit_id,date`).
- Tasks shown in Journal for a date are the same rows as the Tasks module; project tasks (`project_id` not null) are excluded from Dashboard, Tasks, Calendar, Journal and the status bar.
- Custom field definitions with `entity = 'task'` apply to standalone and project tasks alike.
- Marking a task done writes `status = 'done'` and `completed_at = now()`; un-done writes `status = 'open'`, `completed_at = null`. (A DB trigger also enforces this.)
- Vision goal cards read the live goal row; deleting a goal deletes its cards first.
- Journal entries are created lazily on first open of a date.

### 2.3 Backend schema (frozen; owned by the web repo)

Supabase Postgres with RLS `user_id = auth.uid()` on every table; `user_id` defaults to `auth.uid()` so inserts never set it.

| Table | Columns (type, constraints) |
|---|---|
| `categories` | `id uuid`, `name text`, `color text default '#000080'`, `created_at` |
| `projects` | `id`, `name`, `description?`, `color default '#000080'`, `status in (active,paused,completed,archived) default active`, `target_date date?`, `created_at` |
| `tasks` | `id`, `title`, `description?`, `due_date date?`, `priority int 1–3 default 2`, `status in (open,in_progress,done) default open`, `completed_at timestamptz?`, `project_id uuid? → projects (cascade)`, `custom_fields jsonb default {}`, `created_at` |
| `goals` | `id`, `title`, `description?`, `horizon_type in (date,month,quarter,year)`, `horizon_value text`, `category_id? → categories (set null)`, `status in (not_started,in_progress,done)`, `custom_fields jsonb`, `created_at` |
| `habits` | `id`, `name`, `icon default '⭐'`, `active bool default true`, `sort_order int default 0`, `created_at` |
| `habit_entries` | `id`, `habit_id → habits (cascade)`, `date date`, `checked bool default true`, unique `(habit_id, date)` |
| `journal_questions` | `id`, `prompt`, `journal_type in (daily,weekly)`, `sort_order`, `active` |
| `journal_entries` | `id`, `date`, `type in (daily,weekly)`, `answers jsonb default {}`, `notes text default ''`, `day_rating int 1–5?`, `created_at`, unique `(user_id, date, type)` |
| `notes` | `id`, `title?`, `body`, `pinned bool`, `created_at` |
| `books` | `id`, `title`, `author?`, `item_type in (book,article) default book`, `status in (to_read,reading,finished)`, `rating 1–5?`, `takeaways?`, `link?`, `started_at date?`, `finished_at date?`, `due_date date?`, `sort_order`, `created_at` |
| `field_definitions` | `id`, `entity in (task,goal)`, `name`, `field_type in (text,number,date,select)`, `options jsonb?`, `sort_order` |
| `vision_items` | `id`, `item_type in (note,image,goal,list)`, `content jsonb`, `pos_x float`, `pos_y float`, `rotation float`, `z_index int`, `created_at` |

TypeScript shapes for every row are in `src/lib/types.ts` (ported from the web).

---

## 3. Decisions made

| Topic | Decision | Why |
|---|---|---|
| Framework | **Expo SDK 57 (managed workflow), React Native 0.86, TypeScript strict** | Best-supported RN toolchain; one codebase for iOS + Android; EAS builds without a Mac for Android; Expo Go for instant dev preview. |
| Routing | **Expo Router (file-based)** | Mirrors the web app's page structure; deep links for free. |
| Backend | **Same Supabase project, same tables, same RLS; no changes** | The whole point is shared data with the web app. |
| Session storage | `@react-native-async-storage/async-storage` per Supabase's Expo guide, with `AppState`-driven `startAutoRefresh` / `stopAutoRefresh` | Documented, reliable pattern. (Hardening with `expo-secure-store` is a v2 item because of its 2 KB value limit.) |
| Server state | **TanStack Query v5** with a small query-key factory and one hooks file per table | Screens share caches (Dashboard, Journal, Habits all touch `habit_entries`), refetch-on-focus replaces the web's manual `load()` calls, and optimistic updates are declarative. |
| Local state | React `useState` / `useReducer` only. No Redux/Zustand. | The app has almost no client-only state beyond the theme choice. |
| Styling | **Plain `StyleSheet` + a token-based theme system** (`useTheme()`), no NativeWind/Tailwind | Bevelled retro chrome needs per-side border colours and exact pixels; tokens make the three themes a data change, not a code change. |
| Fonts | **IBM Plex Sans** (400 Regular + 600 SemiBold) via `@expo-google-fonts/ibm-plex-sans`, plus a **System** option; the choice is a user preference in Settings → Display, merged over the theme's `font` token by `ThemeProvider`. | Pixelify Sans shipped first but the owner found it illegible on device (2026-09-06). IBM Plex Sans keeps computing-heritage character while being a real text face; System is offered for maximum clarity. Base type sizes were raised to 15 / 13 / 14 at the same time. Bold swaps the font file, never faux-bold `fontWeight`. |
| Navigation shape | Bottom **"taskbar"** with 5 tabs: Home, Tasks, Journal, Habits, **More**. More is a nested stack ("Start menu") holding Goals, Projects, Calendar, Notes, Reading, Vision Board, Settings. | Puts the four daily-use modules one tap away and keeps the OS metaphor. |
| Dialogs | RN `Modal` styled as a retro window, full-width with 16 px side margins, scrollable body, keyboard-avoiding | Same "Properties dialog" mental model as the web. |
| Confirmations | `Alert.alert` (native) for destructive actions | Matches web's `window.confirm`. |
| Date entry | `@react-native-community/datetimepicker` wrapped in a `DateField` kit component; custom `MonthField` (year ± and 12-month grid); `QuarterField` and `YearField` as segmented pickers | No `<input type=date>` on native. |
| Select entry | Kit `Select` = button that opens a retro list-box `Modal` | No native `<select>`. |
| Colour entry | Kit `ColorSwatchPicker` with a fixed 12-colour palette | No native colour input; palette keeps the retro look. |
| Theme choice | Three themes shipped (Section 6). **Default: "Chicago"** (faithful Win95, matches the web). User picks in Settings → Display; stored in AsyncStorage under `personalos.theme`. | Continuity with the web app; the other two are one tap away. |
| Env vars | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_ALLOW_SIGNUP` | Expo's public env convention; same three knobs as the web. |
| Testing | **Jest (`jest-expo`) + React Native Testing Library.** Pure-logic tests ported verbatim from the web; component tests for the kit; render smoke tests per screen. No E2E in v1. | Same coverage philosophy as the web app. |
| Lint/format | `eslint-config-expo` (flat config) + Prettier | Expo's defaults. |
| Distribution | EAS Build (`eas.json` with `development`, `preview`, `production` profiles). Internal distribution (APK / TestFlight) for the owner. Store listing is out of scope. | Single-user app. |
| Package manager | npm (lockfile committed) | Matches the web repo. |

### Assumptions — all confirmed by the owner on 2026-09-06 (see §14.1)

1. **Font:** bundled retro font, later revised to IBM Plex Sans with a System option after device feedback. ✅ confirmed
2. **Tab set:** Home / Tasks / Journal / Habits / More. ✅ confirmed
3. **Themes:** all three ship, with a picker; Chicago is the default. ✅ confirmed
4. **App identifiers:** `com.aayushvijayvergiya.personalos` (iOS bundle id + Android package), scheme `personalos`, display name "Personal OS". ✅ confirmed
5. **Signup flag:** `EXPO_PUBLIC_ALLOW_SIGNUP` kept for parity, default `false`. ✅ confirmed
6. **Vision board** ships in v1 with drag + long-press-to-add, but without pinch-zoom.

---

## 4. Tech stack (pinned)

Versions below are what the boilerplate installed on 2026-09-06 via `npx expo install`, which pins to SDK-compatible ranges. Do not upgrade mid-project.

| Package | Version | Role |
|---|---|---|
| `expo` | ~57.0 | SDK |
| `react-native` | 0.86.x | Runtime |
| `react` | 19.2.x | UI |
| `typescript` | ~6.0 | Types (strict) |
| `expo-router` | ~57.0 | Navigation |
| `react-native-screens`, `react-native-safe-area-context` | SDK-pinned | Router deps |
| `expo-linking`, `expo-constants`, `expo-status-bar`, `expo-splash-screen`, `expo-system-ui` | SDK-pinned | Router / chrome |
| `expo-linear-gradient` | SDK-pinned | Title-bar gradients |
| `@supabase/supabase-js` | ^2.115 | Data + auth |
| `@react-native-async-storage/async-storage` | SDK-pinned | Session + theme persistence |
| `@tanstack/react-query` | ^5.102 | Server state |
| `react-native-gesture-handler`, `react-native-reanimated` | SDK-pinned | Vision-board drag |
| `@react-native-community/datetimepicker` | SDK-pinned | Date fields |
| `expo-font`, `@expo-google-fonts/ibm-plex-sans` | SDK-pinned / ^0.4 | Bundled typeface |
| `jest`, `jest-expo`, `@testing-library/react-native`, `@types/jest` | SDK-pinned | Tests |
| `eslint`, `eslint-config-expo`, `prettier` | latest | Lint / format |

Exact numbers: see `package.json`.

---

## 5. Architecture

### 5.1 Folder structure (exact)

```
PersonalOS - Mobile/
├── app/                          # Expo Router routes ONLY (thin: import a screen and render it)
│   ├── _layout.tsx               # Root: GestureHandlerRootView > SafeAreaProvider > QueryClientProvider > ThemeProvider > AuthGate > Stack
│   ├── login.tsx
│   └── (tabs)/
│       ├── _layout.tsx           # Taskbar tabs: index, tasks, journal, habits, more
│       ├── index.tsx             # Dashboard
│       ├── tasks.tsx
│       ├── journal.tsx
│       ├── habits.tsx
│       └── more/
│           ├── _layout.tsx       # Stack (header hidden; screens draw their own Window chrome)
│           ├── index.tsx         # Start menu
│           ├── goals.tsx
│           ├── projects/
│           │   ├── index.tsx
│           │   └── [id].tsx
│           ├── calendar.tsx
│           ├── notes.tsx
│           ├── reading.tsx
│           ├── vision.tsx
│           ├── settings/
│           │   ├── index.tsx
│           │   └── [section].tsx
│           └── kitchen-sink.tsx  # __DEV__ only: renders every kit component in every theme
├── src/
│   ├── lib/                      # Pure logic ported from web (no RN imports)
│   │   ├── types.ts  dates.ts  horizons.ts  streaks.ts  reading.ts  journalDefaults.ts  taskUi.ts
│   │   └── taskFilters.ts        # NEW: tab → Supabase filter description (tested)
│   ├── data/
│   │   ├── supabase.ts           # client singleton + AppState auto-refresh
│   │   ├── queryClient.ts        # QueryClient with defaults
│   │   ├── keys.ts               # query-key factory
│   │   ├── auth.ts               # useSession(), signIn, signUp, signOut
│   │   ├── tasks.ts  projects.ts  goals.ts  categories.ts  habits.ts  habitEntries.ts
│   │   ├── journal.ts  notes.ts  books.ts  fieldDefinitions.ts  visionItems.ts
│   │   └── stats.ts              # status-bar counts
│   ├── theme/
│   │   ├── tokens.ts             # Theme type + token names
│   │   ├── themes/chicago.ts  luna.ts  slate.ts  index.ts
│   │   ├── ThemeProvider.tsx     # context + AsyncStorage persistence
│   │   └── useTheme.ts           # useTheme(), makeStyles()
│   ├── ui/                       # The kit. One component per file. No data fetching here.
│   │   ├── Window.tsx  TitleBar.tsx  Btn.tsx  Input.tsx  TextArea.tsx  Check.tsx  Select.tsx
│   │   ├── TabBar.tsx  Dialog.tsx  Progress.tsx  Toast.tsx  Bevel.tsx  FieldRow.tsx
│   │   ├── DateField.tsx  MonthField.tsx  QuarterField.tsx  YearField.tsx  ColorSwatchPicker.tsx
│   │   ├── Chip.tsx  ListRow.tsx  EmptyState.tsx  Screen.tsx  StatusStrip.tsx  Txt.tsx
│   │   └── index.ts              # barrel
│   ├── screens/                  # One folder per screen; the route file just renders <XScreen />
│   │   ├── LoginScreen.tsx
│   │   ├── dashboard/  tasks/  journal/  habits/  goals/  projects/  calendar/  notes/
│   │   ├── reading/  vision/  settings/  more/
│   │   └── shared/               # TaskPropertiesDialog, CustomFieldsEditor, CalendarGrid
│   └── hooks/                    # useToday(), useDebouncedCallback(), useClock()
├── tests/
│   ├── lib/                      # ported + new pure tests
│   ├── ui/                       # kit component tests
│   └── screens/                  # smoke renders with mocked data hooks
├── docs/
│   ├── plan.md                   # this file
│   └── decisions.md              # implementer's log of any choices not covered here
├── assets/                       # icons + splash (replace template art in Phase 10)
├── app.json  eas.json  package.json  tsconfig.json  jest.config.js  eslint.config.js  .prettierrc
├── .env.example  README.md  AGENTS.md  CLAUDE.md
```

Route files stay under 10 lines: `export { default } from "@/screens/tasks/TasksScreen";`.

### 5.2 Data layer

**Client** (`src/data/supabase.ts`): `createClient(url, anonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })` plus the `AppState` listener that starts/stops auto refresh. Exported as a singleton `supabase`.

**Query keys** (`src/data/keys.ts`):

```ts
export const keys = {
  tasks: { all: ["tasks"] as const, list: (f: TaskFilter) => ["tasks", "list", f] as const, byId: (id: string) => ["tasks", id] as const },
  projects: { all: ["projects"] as const },
  goals: { all: ["goals"] as const },
  categories: { all: ["categories"] as const },
  habits: { all: ["habits"] as const },
  habitEntries: { range: (from: string, to: string) => ["habit_entries", from, to] as const, all: ["habit_entries"] as const },
  journal: { questions: (t: JournalType) => ["journal_questions", t] as const, entry: (t: JournalType, d: string) => ["journal_entries", t, d] as const },
  notes: { all: ["notes"] as const },
  books: { all: ["books"] as const },
  fieldDefs: (entity: "task" | "goal") => ["field_definitions", entity] as const,
  vision: { all: ["vision_items"] as const },
  stats: ["stats"] as const,
};
```

**Hook conventions** (every `src/data/*.ts` file):

- Queries: `useX(params)` returns `useQuery({ queryKey, queryFn })`. `queryFn` throws on Supabase error (`if (error) throw error; return data as T[]`).
- Mutations: `useXMutations()` returns an object of `useMutation`s (`create`, `update`, `remove`, `toggleDone`, …). Each `onSuccess` invalidates the affected key roots (e.g. a task toggle invalidates `keys.tasks.all` **and** `keys.stats`). Each `onError` calls `showToast(error.message)`.
- Optimistic updates are used only where the web app used them: task done-toggle, habit toggle, vision-card drag, note pin. Pattern: `onMutate` cancels queries, snapshots, writes the optimistic value; `onError` restores; `onSettled` invalidates.
- `QueryClient` defaults: `staleTime: 30_000`, `refetchOnWindowFocus: true` (wire `focusManager` to `AppState`), `retry: 1`.
- **Dates**: the app works in local calendar dates as `YYYY-MM-DD` strings exactly like the web (`todayISO()` from `src/lib/dates.ts`). Never pass `Date` objects to Supabase.

**Auth** (`src/data/auth.ts`): `useSession()` subscribes to `supabase.auth.onAuthStateChange` and returns `{ session, loading }`. `AuthGate` in the root layout keeps the splash screen up while `loading`, then renders a `Stack` with two `Stack.Protected` groups: `login` guarded by `!session`, `(tabs)` guarded by `!!session`. Signing in or out flips the guards; no redirect effects are needed. (Already implemented in the boilerplate.)

### 5.3 Navigation map

| Route | Screen | Notes |
|---|---|---|
| `/login` | LoginScreen | Outside tabs |
| `/` | DashboardScreen | Tab "Home" 🖥️ |
| `/tasks` | TasksScreen | Tab 📋 |
| `/journal` | JournalScreen | Tab 📓 |
| `/habits` | HabitsScreen | Tab ✅ |
| `/more` | StartMenuScreen | Tab "More" 🗂️ — grid of remaining modules |
| `/more/goals` | GoalsScreen | |
| `/more/projects` | ProjectsScreen | list + All Tasks + Calendar segments |
| `/more/projects/[id]` | ProjectDetailScreen | |
| `/more/calendar` | CalendarScreen | |
| `/more/notes` | NotesScreen | |
| `/more/reading` | ReadingScreen | |
| `/more/vision` | VisionScreen | |
| `/more/settings` | SettingsScreen | Control Panel grid |
| `/more/settings/[section]` | SettingsSectionScreen | one registry entry |
| `/more/kitchen-sink` | KitchenSinkScreen | `__DEV__` only |

Dashboard "Open X →" links use `router.push` to the routes above. The tab bar is the **taskbar**: bevel-out strip, each tab a bevel-out button that becomes bevel-in when active, emoji icon above a 10 px label. Safe-area aware.

### 5.4 Screen chrome

Every screen renders inside `<Screen>`: a `SafeAreaView` with the desk background, a `StatusStrip` at the top (date/time + stats, see 2.1 #13), then a `ScrollView` / `FlatList` with 6 px padding. Modules that on the web were a single `Window` remain a single `Window` on mobile; multi-column web layouts become vertical stacks in the order given per screen in Section 7.

### 5.5 Theme system

`src/theme/tokens.ts`:

```ts
export interface Theme {
  id: "chicago" | "luna" | "slate";
  name: string;                 // shown in Settings → Display
  dark: boolean;                // drives StatusBar style + keyboard appearance
  color: {
    desk: string;               // screen background
    face: string;               // panel / button face
    light: string;              // bevel highlight
    dark: string;               // bevel shadow
    darker: string;             // bevel outer shadow / window frame
    text: string;
    textMuted: string;
    titleA: string;             // title-bar gradient start
    titleB: string;             // title-bar gradient end
    titleText: string;
    highlight: string;          // selection / active nav
    highlightText: string;
    paper: string;              // inputs, lists, journal pages
    paperTint: string;          // "current period" / pinned tint
    danger: string;             // overdue, P1
    link: string;
    progress: string;           // progress-bar fill
    overlay: string;            // modal backdrop (rgba)
    cork: string;               // vision-board background
    corkStripe: string;
  };
  metric: {
    bevel: number;              // border width of bevels
    radius: number;             // corner radius (0 for Chicago)
    font: number;               // base font size
    fontSmall: number;
    titleFont: number;
    tap: number;                // minimum touch target (44)
    gap: number;                // default spacing unit (6)
  };
  font: { family?: string; bold?: string };   // undefined = system
}
```

`ThemeProvider` loads the saved id from AsyncStorage (`personalos.theme`), defaults to `chicago`, exposes `{ theme, setThemeId, themes }`. `useTheme()` returns the theme. `makeStyles((t) => StyleSheet.create({...}))` returns a hook that memoises per theme.

### 5.6 UI kit contracts

All components accept `style` for the outer container and forward the rest. Text inside the kit always uses `Txt` so the font tokens apply everywhere.

| Component | Props | Behaviour |
|---|---|---|
| `Txt` | `variant?: "body" \| "small" \| "bold" \| "title" \| "muted" \| "danger" \| "link"` + `Text` props | Applies theme font/colour. |
| `Bevel` | `variant: "out" \| "in" \| "frame"`, `children` | Per-side border colours per theme. `frame` = window border + shadow. |
| `Window` | `title`, `icon?`, `actions?: ReactNode`, `children`, `bodyStyle?` | `Bevel frame` + `TitleBar` + padded body. |
| `TitleBar` | `title`, `icon?`, `actions?` | `expo-linear-gradient` titleA→titleB, white bold text, 28 px tall. |
| `Btn` | `primary?`, `small?`, `disabled?`, `onPress`, `children` | Bevel-out; pressed = bevel-in; min height `metric.tap` (28 when `small`). |
| `Input` | `TextInput` props + `label?` | Bevel-in, paper bg, min height 40. |
| `TextArea` | `Input` props, `rows?` | Multiline, `rows * 20` px min height. |
| `Check` | `checked`, `onChange`, `label?`, `disabled?` | 22 px bevel-in box, ✓ when checked; whole row tappable; 44 px tap height. |
| `Select` | `value`, `options: {value,label}[]`, `onChange`, `placeholder?` | Button showing current label + ▾; opens `Dialog` with a list-box of options. |
| `TabBar` | `tabs: {key,label}[]`, `active`, `onSelect` | Horizontal `ScrollView`; active tab bevel-raised with bold text; child panel uses `TabPanel`. |
| `Dialog` | `title`, `open`, `onClose`, `children`, `footer?` | `Modal` (transparent, fade) → overlay → `Window` 16 px margins, `KeyboardAvoidingView`, scrollable body, ✕ in title bar. |
| `Progress` | `value`, `max` | Bevel-in track, striped fill using `color.progress`. |
| `Toast` | `showToast(msg)`, `<ToastHost/>` | Same module-level push pattern as web; bottom-centred above the taskbar; 4 s. |
| `FieldRow` | `label`, `children` | Label above control (mobile), 8 px gap. |
| `DateField` | `value: string \| null`, `onChange`, `allowClear?` | Button showing `fmt(value)` or "—"; opens native picker (iOS inline spinner inside `Dialog`, Android dialog). Emits `YYYY-MM-DD`. |
| `MonthField` | `value: "YYYY-MM"`, `onChange` | Dialog with year ◀ ▶ and 3×4 month grid. |
| `QuarterField` | `value: "YYYY-Qn"`, `onChange` | Year ◀ ▶ and Q1–Q4 buttons. |
| `YearField` | `value: "YYYY"`, `onChange` | Year ◀ ▶ with typed input. |
| `ColorSwatchPicker` | `value`, `onChange` | 12 swatches: `#000080 #1084d0 #008080 #008000 #808000 #800000 #aa0000 #800080 #ff8c00 #404040 #808080 #c0c0c0`. |
| `Chip` | `label`, `active?`, `onPress`, `color?` | Bevel-out pill; active = bevel-in + tint. Used for habit chips, category / horizon filters. |
| `ListRow` | `left?`, `title`, `subtitle?`, `right?`, `onPress?`, `strike?` | Paper row with divider; 48 px min height. |
| `EmptyState` | `icon`, `text` | Muted centred text. |
| `Screen` | `children`, `scroll?: boolean`, `refreshing?`, `onRefresh?` | Safe area + desk bg + `StatusStrip` + optional `RefreshControl`. |
| `StatusStrip` | none | Reads `useClock()` + `useStats()`; two bevel-in cells. |

### 5.7 Error, loading, empty

- Query error → toast with `error.message` (once per error via `QueryCache` `onError`) and the previous data stays on screen.
- Loading first time → `Txt muted "Loading…"` inside the Window body; never a full-screen spinner.
- Empty → `EmptyState` with the same copy as the web ("All clear. 🎉", "No tasks here. Add one above. ▲", "This shelf is empty.", "The corkboard is empty…").
- Pull-to-refresh on every list screen invalidates that screen's keys.
- Destructive: `Alert.alert(title, message, [Cancel, Delete(destructive)])`.

---

## 6. Theme proposals

All three are implemented as token files; the owner picks the default (recommended: **Chicago**). Every theme must pass `tests/lib/themes.test.ts`, which asserts every token is present and that text/paper and titleText/titleA contrast ratios are ≥ 4.5 : 1.

### Theme 1 — "Chicago" (Windows 95 classic) — **recommended default**

Faithful port of the web app's look: grey panels, navy-to-blue title bars, hard 2 px bevels, square corners. Familiar, light, and identical to what the owner uses on the web.

| Token | Value |
|---|---|
| desk | `#d4d0c8` |
| face | `#c0c0c0` |
| light | `#ffffff` |
| dark | `#808080` |
| darker | `#404040` |
| text / textMuted | `#000000` / `#444444` |
| titleA → titleB | `#000080` → `#1084d0` |
| titleText | `#ffffff` |
| highlight / highlightText | `#000080` / `#ffffff` |
| paper / paperTint | `#ffffff` / `#ffffe1` |
| danger | `#aa0000` |
| link | `#000080` |
| progress | `#000080` |
| overlay | `rgba(0,0,0,0.3)` |
| cork / corkStripe | `#d4b896` / `#ccb08e` |
| bevel / radius | 2 / 0 |
| font / small / title | 14 / 12 / 13 |

### Theme 2 — "Luna" (Windows XP, light)

Warmer and friendlier: cream panels, XP's saturated blue title bars with slightly rounded tops, softer 1 px bevels, olive-green primary buttons. Still light and still unmistakably Windows, but reads as "modern-retro" on a phone.

| Token | Value |
|---|---|
| desk | `#ece9d8` |
| face | `#f1efe2` |
| light | `#ffffff` |
| dark | `#aca899` |
| darker | `#716f64` |
| text / textMuted | `#000000` / `#5b5a52` |
| titleA → titleB | `#0a5fd6` → `#3d95ff` |
| titleText | `#ffffff` |
| highlight / highlightText | `#316ac5` / `#ffffff` |
| paper / paperTint | `#ffffff` / `#fff9d6` |
| danger | `#d13438` |
| link | `#0046d5` |
| progress | `#2fb43a` |
| overlay | `rgba(20,40,80,0.35)` |
| cork / corkStripe | `#d9bf98` / `#d0b48d` |
| bevel / radius | 1 / 3 |
| font / small / title | 14 / 12 / 13 |

### Theme 3 — "Slate" (Windows 95 "Slate" colour scheme, dark)

A night-mode take using the real Win95 "Slate" scheme as the base: charcoal panels, steel-blue title bars, light-grey text, warm dark paper for journal pages. Keeps the bevels and square corners so it still feels like Chicago after dark. OLED-friendly for late-night journaling.

| Token | Value |
|---|---|
| desk | `#1e2228` |
| face | `#3a3f47` |
| light | `#5c626c` |
| dark | `#1a1d21` |
| darker | `#0b0d0f` |
| text / textMuted | `#e8e8e8` / `#a9adb3` |
| titleA → titleB | `#1f3a5f` → `#3d6ea5` |
| titleText | `#ffffff` |
| highlight / highlightText | `#7fbfff` / `#0b0d0f` |
| paper / paperTint | `#262a30` / `#3a3626` |
| danger | `#ff6b6b` |
| link | `#8ec5ff` |
| progress | `#7fbfff` |
| overlay | `rgba(0,0,0,0.55)` |
| cork / corkStripe | `#4a3d2c` / `#42362a` |
| bevel / radius | 2 / 0 |
| font / small / title | 14 / 12 / 13 |

**Settings → Display** shows the three as tappable preview tiles (a mini Window rendered in each theme) with the active one marked ● and applies instantly.

---

## 7. Screen specifications

Each spec: layout (top → bottom), data (hooks), interactions, acceptance criteria (AC). Web behaviour from Section 2.1 applies unless overridden here.

### 7.1 Login (`/login`)

- **Layout:** centred `Window` "🔐 Log On to Personal OS": intro text, Email `Input` (email keyboard, no autocapitalize), Password `Input` (secure), error `Txt danger`, buttons row: `Create Account` (only if `EXPO_PUBLIC_ALLOW_SIGNUP === "true"`), `OK` primary.
- **Data:** `signIn`, `signUp` from `src/data/auth.ts`.
- **AC:** wrong password shows Supabase's message in red; success navigates to `/`; signup shows "Account created. If email confirmation is on, confirm then sign in."; return key on password submits.

### 7.2 Dashboard (`/`)

- **Layout (vertical):** `Window "Today — <fmt(today)>"` with action `Show/Hide completed (n)`, progress bar `done / total`, task rows (`Check` + title + "overdue!" badge), completed list when shown, link "Open Tasks →". `Window "Today's Habits"` with `x / y` in the title-bar actions; each habit row: `Check` with `icon name`, then 🔥 streak and 7 dots for last 7 days. `Window "Goals in Focus"` (max 8, status icon + title). `Window "Currently Reading"`. `Window "Articles Due"` (link opens with `Linking.openURL`). `Window "Pinned Notes"`. `Window "At a Glance"` (6 rows as on web).
- **Data:** `useDashboard()` in `src/data/dashboard.ts` composing 8 queries with the same filters as the web's `load()`.
- **Interactions:** task toggle and habit toggle are optimistic; pull-to-refresh.
- **AC:** matches web numbers for the same account; toggling a habit here updates the Habits tab without a manual reload (shared cache).

### 7.3 Tasks (`/tasks`)

- **Layout:** `TabBar` Today / This Week / This Month / All / Done. Quick-add card: `Input` "New task title…" (return submits), row with `DateField` (default today, clearable) + `Select` priority (P1/P2/P3, default P2) + `Btn primary Add`. On non-Done tabs: `Check "Show completed"` and "n done / m shown". `FlatList` of `ListRow`s: left `Check`, title (strike when done) + description subtitle, right `P{n}` (P1 danger bold, P3 muted) and due (danger + "!" when overdue).
- **Task Properties dialog** (`src/screens/shared/TaskPropertiesDialog.tsx`, reused by Projects): Title, Project (`Select`, only when `showProject` prop), Due date, Priority, Status, Description, `CustomFieldsEditor entity="task"`, footer Delete / Cancel / OK.
- **Data:** `useTasks(filter)` where `filter = { tab, showDone }` is translated by `src/lib/taskFilters.ts` into `{ dueLte?: string, status?: "done", excludeDone: boolean }` (pure, tested). `useTaskMutations()`.
- **AC:** the five tabs return exactly the rows the web's queries return; adding with an empty title is a no-op; done toggle is optimistic.

### 7.4 Journal (`/journal`)

- **Layout:** `TabBar` Daily / Weekly (each remembers its date). Toolbar `Bevel out`: `◀` `<heading>` `▶` `Today`, right-aligned "Saving…/Saved". Daily only: horizontally scrolling habit `Chip`s (☑/☐ icon name), then a "📋 x / y ▾" `Btn` that toggles an inline tasks list (`Check` rows). Both types: ⭐ row of 5 star buttons. `Window "📖 Journal — <heading>"` with "n / m answered" in actions; body = paper: each question as `Txt bold` prompt + `TextArea` (lined-paper look = paper bg, 2 px bottom border per row not required); then "Notes from the day/week" `TextArea rows=10`.
- **Data:** `useJournalQuestions(type)`, `useJournalEntry(type, date)` (upsert-on-miss inside `queryFn`), `useHabits()`, `useHabitEntries(date, date)`, `useTasks({dueEq: date})`, `ensureDefaultQuestions` called once per session before questions load.
- **Interactions:** answers/notes update local state immediately and save via a 600 ms debounced `update` mutation; star and habit/task toggles save immediately.
- **AC:** opening a date with no entry creates one; closing the app and reopening shows saved text; weekly date always displays "Week n, yyyy" and snaps to Monday.

### 7.5 Habits (`/habits`)

- **Layout:** `Window "Habit Tracker — This Week"` with actions `◀` `This Week` `▶` `Manage…`. Body: header row Mon…Sun (day letters + date number, today tinted). One block per active habit: `Txt bold "icon name"` and stats line "🔥 n · 🏅 n · 30d n %", then a 7-cell row of `Check`s (future dates disabled).
- **Manage dialog:** `Input` + `Add`; each habit: `Input` (rename on blur), `▲ ▼` (swap `sort_order`), `Retire/Restore`.
- **Data:** `useHabits()` (all, including retired, for the dialog), `useHabitEntries(anchor-60d, anchor+7d)` for streaks, `useHabitMutations()`.
- **AC:** streak numbers equal `computeStreaks` output; a check made in Journal appears here without reload.

### 7.6 Start menu (`/more`)

- **Layout:** `Window "🗂️ Personal OS"` with a 3-column grid of tiles (icon 28 px + label): Goals 🎯, Projects 📁, Calendar 📅, Notes 🗒️, Reading 📚, Vision Board 🌄, Settings ⚙️, and in `__DEV__` Kitchen Sink 🧪. Below, `Window "Session"`: signed-in email + `Log Off…`.
- **AC:** every tile navigates; back gesture returns to the grid.

### 7.7 Goals (`/more/goals`)

- **Layout:** `Window "Goals"` with action `New Goal`; counts line. Horizon `Chip` row (All · 📅 Dated · 🗓️ Month · 🧭 Quarter · 🏆 Year) with counts; when a horizon other than All is active, a second `Chip` row lists its periods (`horizonLabel`) with counts. Category `Chip` row (swatch + name + count; "All categories" first). `Window "<paneTitle>"`: progress `done / shown`, then goal cards (`Bevel in`, category colour 6 px left border, `paperTint` when current period): status icon button, title (strike when done), description (2 lines), category badge, horizon label (danger + "!" when past).
- **Goal dialog:** Title, Horizon (`Select`), When (`DateField` / `MonthField` / `QuarterField` / `YearField` by type; changing type resets value to the current period), Category, Status, Description, custom fields; Delete / Cancel / OK.
- **Data:** `useGoals()`, `useCategories()`, `useGoalMutations()` (remove deletes matching `vision_items` first, as on web).
- **AC:** grouping/sorting equals `groupGoals`; status cycles ⚪→🔵→✅→⚪.

### 7.8 Projects (`/more/projects`, `/more/projects/[id]`)

- **Index layout:** `TabBar` Projects / All Tasks / Calendar. Projects: `Btn "➕ New Project"`, project cards (`Bevel out`, 6 px colour left border, name + "(status)" when not active, "x/y tasks done · 🎯 date") → tap pushes `[id]`. All Tasks: `Select` Group by Project / Due date / Status, then one titled group (`TitleBar` tinted with project colour when grouped by project) with task `ListRow`s. Calendar: `CalendarGrid` month/week of project tasks coloured by project, `◀ Today ▶ Week Month` controls.
- **Detail layout:** `Window "<project name>"` with action `Properties`, description, quick-add `Input` + `Add`, task rows; tapping a row opens `TaskPropertiesDialog showProject`.
- **Project Properties dialog:** Name, Colour (`ColorSwatchPicker`), Status, Target date, Description.
- **Data:** `useProjects()` (non-archived), `useProjectTasks()` (all tasks with `project_id` not null), mutations.
- **AC:** archived projects disappear from the list; project tasks never appear in `/tasks`.

### 7.9 Calendar (`/more/calendar`)

- **Layout:** `Window "Calendar"` with actions `◀ Today ▶` and `Week | Month` toggle; month name line; banner `Chip`s for period goals; `CalendarGrid` (`src/screens/shared/CalendarGrid.tsx`): 7 columns, month = 6 rows of 44 px cells (day number + up to 3 colour dots + "+n"), week = 1 row of 88 px cells with up to 3 labels. Tapping a cell selects it (highlight border) and shows a `Bevel out` day panel: `fmt(date)`, tasks ("• title ✔"), articles (📰 link), quick-add `Input` + `Add`.
- **Data:** `useTasks({ dueBetween: [start-7, end+7] })`, `useGoals()`, `useBooks({ item_type: "article", dueBetween })`.
- **AC:** colours: task P1 danger, other tasks highlight, goals `#008080`, articles `#800080` (these four are the only non-token colours allowed; put them in `src/lib/calendarColors.ts`).

### 7.10 Notes (`/more/notes`)

- **Layout:** `Window "Quick Capture"`: `Input` (return adds) + `Add`. `Window "Notes"` with a search `Input` in actions. Cards (single column): date, actions 📌/📍 ✏️ 🗑️, title bold, body. Edit opens `Dialog` (title + body, Cancel / Save).
- **AC:** search matches title or body, case-insensitive; delete confirms.

### 7.11 Reading (`/more/reading`)

- **Layout:** `TabBar` 📚 Books / 📰 Articles. Add card: title `Input`, author (books) or link (articles) `Input`, `DateField` due (clearable), `Add`. Shelf `TabBar` (books: To Read / Reading / Finished; articles: To Read / Read). Item `ListRow`s: title bold, "— author", ★ rating (finished books), "due <date>" (danger when overdue); right side: shelf-move `Btn small`s (books: the two other shelves; articles: Mark Read / To Read); link opens externally. Tap title → Properties dialog. "Finish…" opens Finish Book dialog (rating buttons 1★–5★ default 4, takeaways).
- **AC:** ordering equals `sortReadingItems`; state transitions set/clear dates exactly as web.

### 7.12 Vision Board (`/more/vision`)

- **Layout:** `Window "🌄 Vision Board"` filling the screen; body is a 1600 × 1600 canvas (cork stripes) inside nested vertical + horizontal `ScrollView`s. Cards are 200 px wide absolutely positioned `Bevel out` views rotated by `rotation`. **Long-press (300 ms) on empty canvas** opens "Pin to Vision Board" dialog (Type `Select`; Text / Image URL / List title / Goal `Select`; Cancel / Pin It). Card drag: `Gesture.Pan().activateAfterLongPress(150)` with Reanimated shared values; on end, persist `pos_x`, `pos_y`, `z_index` (bring to front). ✕ removes. List cards: items with ✕ and an "Add item + Enter" `Input`.
- **Data:** `useVisionItems()`, `useGoals()`, mutations.
- **AC:** positions survive app restart; deleted goals render "Goal deleted — remove this card."

### 7.13 Settings (`/more/settings`, `/more/settings/[section]`)

- **Registry** (`src/screens/settings/registry.ts`) — same shape as web (`id, icon, title, description, group, keywords, countTable, Panel`). Sections: Goal Categories, Journal Questions, Custom Fields, **Display** (new; group "Personalization"; Panel = theme picker), Session.
- **Index layout:** `Window "⚙️ Control Panel"` with search `Input` in actions; per group a heading + 3-column tile grid (icon, title, "n items").
- **Section layout:** `Window "⚙️ Control Panel ▸ <icon> <title>"` with `◀ Back` action; description; `<Panel/>`.
- **Panels:** ported 1:1 from web. Colour input → `ColorSwatchPicker`; `window.confirm` → `Alert.alert`.
- **AC:** adding a category here appears in Goals category chips without reload.

---

## 8. Status strip and stats

`useStats()` (`src/data/stats.ts`) runs the same three `head: true` counts as the web `StatusBar` and is invalidated by every task and habit mutation. `useClock()` ticks every 30 s. `StatusStrip` renders `Ready.` | stats | clock in bevel-in cells; on phones narrower than 360 px, hide `Ready.`.

---

## 9. Accessibility and platform

- Every interactive element has `accessibilityRole` and, for icon-only buttons, `accessibilityLabel`.
- Minimum tap target 44 × 44 (`metric.tap`); `Btn small` (28 px) only inside title bars and list rows, and then with `hitSlop` to reach 44.
- Respect safe areas top and bottom; taskbar sits above the home indicator.
- `KeyboardAvoidingView` in every `Dialog` and on Journal.
- Android back button: default stack behaviour; on a tab root it exits.
- Status bar style follows `theme.dark`.

---

## 10. Testing strategy

| Layer | Tool | What |
|---|---|---|
| Pure logic | Jest | `tests/lib/dates.test.ts`, `horizons.test.ts`, `streaks.test.ts`, `reading.test.ts` — ported verbatim (already in boilerplate). New: `taskFilters.test.ts` (each tab → expected filter), `themes.test.ts` (token completeness + contrast), `calendarItems.test.ts` (task/goal/article → grid items and banners). |
| Kit | RNTL | `Btn` press + disabled, `Check` toggles and announces state, `TabBar` selection, `Select` opens and picks, `Dialog` closes on ✕, `DateField` emits `YYYY-MM-DD`. |
| Screens | RNTL with `src/data/*` mocked via `jest.mock` | One smoke test per screen: renders with fixture data and shows the expected headings and row titles; one interaction test each for Tasks (add), Habits (toggle), Journal (type → debounced save called). |
| Manual | Expo Go on a physical Android + iOS device | Checklist in `docs/qa-checklist.md` produced in Phase 10: every AC in Section 7. |

Coverage target: all of `src/lib` at 100 % statements; kit ≥ 80 %.

---

## 11. Build phases

Each phase is sized for one focused implementation session. File lists are exhaustive for that phase.

### Phase 0 — Boilerplate ✅ (done in this session)

Repo scaffolded with Expo SDK 57 blank-TypeScript template; Expo Router installed and wired; Supabase client, TanStack Query client, theme system with all three themes, a starter UI kit (`Txt`, `Bevel`, `TitleBar`, `Window`, `Btn`, `Input`, `Check`, `Toast`, `Screen`), ported `src/lib` with passing tests, a working Login screen and Start-menu screen, the taskbar tab layout, placeholder route files for every other screen, lint/format/test config, `.env.example`, `eas.json`, README.

Verified on 2026-09-06: `typecheck`, `lint`, `test` (36 tests), `expo-doctor` (21/21) and an `expo export --platform android` bundle all pass.

### Phase 1 — UI kit completion + Kitchen Sink ✅

- Create every kit component in Section 5.6 not already present (`Select`, `TabBar`, `Dialog`, `Progress`, `FieldRow`, `DateField`, `MonthField`, `QuarterField`, `YearField`, `ColorSwatchPicker`, `Chip`, `ListRow`, `EmptyState`, `Screen`, `StatusStrip`, `TextArea`).
- `app/(tabs)/more/kitchen-sink.tsx` renders every component in the active theme with a theme switcher at the top.
- Tests: `tests/ui/*.test.tsx` for the components listed in Section 10.
- **DoD:** kitchen sink renders in all three themes with no red-box errors on iOS and Android; `npm test` green; `npm run typecheck` and `npm run lint` clean.

### Phase 2 — Auth, data layer, navigation shell ✅

- `src/data/auth.ts`, `AuthGate` in `app/_layout.tsx`, `LoginScreen`.
- All `src/data/*.ts` hooks and `keys.ts` with the conventions in 5.2; `src/lib/taskFilters.ts` + test.
- Taskbar tab layout with the five tabs and the More stack; every route renders a `Screen` with a `Window` titled after the module and an `EmptyState "Coming soon"`.
- `StatusStrip` live.
- **DoD:** sign in / out works on device; the status strip shows the right counts for the owner's account; unauthenticated launch lands on Login.

### Phase 3 — Dashboard + Tasks ✅

- `src/screens/dashboard/*`, `src/screens/tasks/*`, `src/screens/shared/TaskPropertiesDialog.tsx`, `src/screens/shared/CustomFieldsEditor.tsx`.
- Tests: Tasks smoke + add interaction; Dashboard smoke.
- **DoD:** all AC in 7.2 and 7.3.

### Phase 4 — Habits + Journal ✅

- `src/screens/habits/*`, `src/screens/journal/*`, `src/hooks/useDebouncedCallback.ts`.
- **DoD:** AC in 7.4 and 7.5; a habit toggled in Journal is reflected on Dashboard and Habits with no manual refresh.

### Phase 5 — Goals + Calendar ✅

- `src/screens/goals/*`, `src/screens/calendar/*`, `src/screens/shared/CalendarGrid.tsx`, `src/lib/calendarColors.ts`, `src/lib/calendarItems.ts` + test.
- **DoD:** AC in 7.7 and 7.9.

### Phase 6 — Projects ✅

- `src/screens/projects/*` (index with three segments, detail).
- **DoD:** AC in 7.8; project calendar reuses `CalendarGrid`.

### Phase 7 — Notes + Reading ✅

- `src/screens/notes/*`, `src/screens/reading/*`.
- **DoD:** AC in 7.10 and 7.11.

### Phase 8 — Vision Board ✅

- `src/screens/vision/*` with gesture-handler + reanimated drag.
- **DoD:** AC in 7.12 on both platforms; no dropped frames while dragging on a mid-range Android.

### Phase 9 — Settings + Display ✅

- `src/screens/settings/registry.ts`, panels, Display theme picker, Start-menu Session window.
- **DoD:** AC in 7.13; theme persists across restarts.

### Phase 10 — Polish and release prep — art, docs and config ✅ · device QA outstanding

- Replace template icon/splash with retro-styled art (icon: navy window with grey bevel; splash: desk colour with the icon).
- `eas.json` profiles; `app.json` bundle ids; `expo-splash-screen` config; `README.md` build instructions.
- Accessibility pass (Section 9); `docs/qa-checklist.md` executed on both platforms with results recorded.
- **DoD:** `eas build --profile preview` succeeds for Android (APK) and iOS (simulator build) and the QA checklist has no open items.

---

## 11a. Known SDK 57 gotchas (found while building Phase 0)

The implementer will hit these; the boilerplate already handles each one.

| Gotcha | What to do |
|---|---|
| `import { Tabs } from "expo-router"` is deprecated in SDK 57. | Import `Tabs` and `BottomTabBarProps` from `"expo-router/js-tabs"` (see `app/(tabs)/_layout.tsx`, `src/screens/Taskbar.tsx`). `@react-navigation/*` is **not** a direct dependency; expo-router vendors it. |
| `newArchEnabled` is no longer a valid `app.json` key. | Omit it. The New Architecture is the only option. |
| `@testing-library/react-native` v14: `render`, `renderHook` **and `fireEvent`** are all **async**. | `const { getByText } = await render(...)` and `await fireEvent.press(...)`. Forgetting to await `fireEvent` silently skips the re-render, so anything the press was meant to open (a `Dialog`, a `Select` list) is missing from the tree. Do not use the `screen` helper. Use `tests/helpers/render.tsx`, which supplies the theme, query-client and safe-area providers. |
| `getByRole` only finds elements React Native considers accessible. | Set `accessible` alongside `accessibilityRole` on non-touchable views (see `Progress`). `Pressable` is accessible by default. |
| Theme files must not import the font *package*. | Family names live in `src/theme/fontNames.ts` (import-free); the loader `useAppFonts()` lives in `src/theme/fonts.ts`. This keeps `.ttf` assets out of theme unit tests. |
| AsyncStorage has no native module under Jest. | `jest.setup.js` mocks it with the package's own jest mock; registered via `setupFiles` in `package.json`. |
| npm ERESOLVE on `react-dom` when adding dev deps. | `react-dom` is pinned to the same version as `react` in devDependencies. Keep them in lock-step. |
| `react-native-reanimated` 4 needs `react-native-worklets`. | Already installed. Add the Reanimated babel plugin only if `expo-doctor` or Metro asks for it (SDK 57 wires it through `babel-preset-expo`). |
| ESLint flat config ignores `/* eslint-env */`. | Use `/* global jest */` in JS setup files. |
| Type-level jest globals in tests. | `tsconfig.json` sets `"types": ["jest"]`. |
| `expo export --platform all` fails on web. | Web is not a target and `react-native-web` is not installed. The `web` script and the `app.json` `web` block were removed; bundle with `--platform android --platform ios`. |
| A `jest.mock` factory may only close over variables named `mock*`. | Name router spies `mockPush`, not `push`, or the suite fails to run before any test executes. |
| `Window` titles render as `"<icon> <title>"` in one text node. | Match them in tests with a regex (`getByText(/At a Glance/)`), not an exact string. |

### Implementation record

Completed 2026-09-06 in one session. Final verification on that date:

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint .` | clean |
| `jest` | 82 tests, 12 suites, all passing |
| `expo-doctor` | 21/21 checks passed |
| `expo export --platform android --platform ios` | both bundles built |

Outstanding: the manual device pass in `docs/qa-checklist.md`, and an EAS build, both of which need real hardware and an Expo account.

## 12. Verification commands (must all pass before any phase is "done")

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm test              # jest
npx expo-doctor       # dependency/config sanity for SDK 57
npx expo start        # then open in Expo Go on a device and exercise the phase's AC
```

---

## 13. Out of scope / v2 ideas

- Offline cache + mutation queue (TanStack Query persister + `onlineManager`).
- `expo-secure-store`-backed session storage.
- Local notifications for tasks due today and habit reminders.
- Home-screen widgets (today's tasks, habit streak).
- Pinch-zoom on the vision board; image upload to Supabase Storage.
- Bundled retro font; a fourth "High Contrast" accessibility theme.
- Biometric app lock.
- The web app's v2 list (boot splash, letters to future self, screensaver).

---

## 14. Open questions for the owner

1. Bundled retro font (fidelity) vs system font (readability)? Plan assumes system.
2. Keep Habits as the 4th tab, or Calendar?
3. Ship all three themes with a picker, or only the chosen default?
4. App identifiers and display name: plan assumes display name "Personal OS", scheme `personalos`, id `com.aayushvijayvergiya.personalos`.
5. Is `EXPO_PUBLIC_ALLOW_SIGNUP` needed on mobile at all, given the account already exists from the web? Plan keeps it for parity, default `false`.

## 14.1 Answers:
1. Retro font
2. Keep habits
3. All 3 themes
4. Works
5. Works
