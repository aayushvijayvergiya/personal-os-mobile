# Manual QA checklist

Run on a physical Android device and an iOS device (or simulator) in Expo Go, signed into the real
Personal OS account, with the web app open side by side to compare. Every item maps to an
acceptance criterion in `docs/plan.md` §7.

Mark each: ✅ pass · ❌ fail (file the detail) · ➖ not applicable.

## Cross-cutting

| # | Check | Android | iOS |
|---|---|---|---|
| 1 | Cold launch shows the splash, then Login when signed out | | |
| 2 | Signing in lands on the Dashboard; signing out returns to Login | | |
| 3 | Session survives a force-quit and relaunch | | |
| 4 | Status strip shows the same counts as the web status bar | | |
| 5 | Clock in the status strip updates within a minute | | |
| 6 | Taskbar shows five tabs; the active one is pressed in | | |
| 7 | All three themes apply instantly and survive a relaunch | | |
| 8 | Text is legible in the retro font at the smallest supported width | | |
| 9 | Safe areas respected: nothing under the notch or home indicator | | |
| 10 | Keyboard never hides the field being typed into | | |
| 11 | A forced network error surfaces a retro toast, not a crash | | |
| 12 | Pull-to-refresh works on every list screen | | |

## Dashboard

| # | Check | Android | iOS |
|---|---|---|---|
| 13 | Today's task list matches the web dashboard exactly | | |
| 14 | Progress bar and "n / m done" agree with the list | | |
| 15 | "Show done (n)" reveals tasks completed today | | |
| 16 | Ticking a task updates the list and the status strip | | |
| 17 | Habit check marks update streak 🔥 and the 7-day dots | | |
| 18 | Goals in Focus shows dated goals ≤ 14 days, this month, this quarter | | |
| 19 | Currently Reading and Articles Due match the Reading shelves | | |
| 20 | Overdue articles are flagged red; links open in the browser | | |
| 21 | Every "Open X →" link navigates to the right module | | |

## Tasks

| # | Check | Android | iOS |
|---|---|---|---|
| 22 | Today / This Week / This Month / All / Done return the same rows as the web | | |
| 23 | "Show completed" adds done rows on non-Done tabs | | |
| 24 | Quick add uses the typed title, the chosen date and priority | | |
| 25 | Adding with an empty title does nothing | | |
| 26 | P1 is red and bold; P3 is grey | | |
| 27 | Overdue dates are red with a trailing "!" | | |
| 28 | Task Properties saves title, date, priority, status, description | | |
| 29 | Custom fields appear and persist | | |
| 30 | Delete asks for confirmation and removes the row | | |

## Journal

| # | Check | Android | iOS |
|---|---|---|---|
| 31 | Opening a fresh date creates its entry once | | |
| 32 | Daily and Weekly tabs each remember their own date | | |
| 33 | Weekly heading reads "Week n, yyyy" and snaps to Monday | | |
| 34 | Typing shows "Saving…" then "Saved"; text survives leaving and returning | | |
| 35 | Habit chips write the same rows as the Habits tab | | |
| 36 | The task drawer lists that day's standalone tasks and ticks them | | |
| 37 | Star rating saves immediately | | |
| 38 | "n / m answered" tracks non-empty answers | | |

## Habits

| # | Check | Android | iOS |
|---|---|---|---|
| 39 | Week grid shows Mon–Sun with today tinted | | |
| 40 | Future days cannot be checked | | |
| 41 | 🔥 current, 🏅 best and 30-day % match the web | | |
| 42 | ◀ / This Week / ▶ move the week | | |
| 43 | Manage: add, rename on blur, reorder ▲▼, Retire and Restore | | |
| 44 | A habit checked in Journal shows here without a manual refresh | | |

## Goals

| # | Check | Android | iOS |
|---|---|---|---|
| 45 | Horizon chips filter to Dated / Month / Quarter / Year with counts | | |
| 46 | Period chips appear for the selected horizon | | |
| 47 | Category chips filter and show counts | | |
| 48 | Status icon cycles ⚪ → 🔵 → ✅ → ⚪ | | |
| 49 | Current-period cards are tinted; past unfinished ones show a red date and "!" | | |
| 50 | Goal dialog: each horizon type shows the right picker and defaults sensibly | | |
| 51 | Deleting a goal also removes its vision-board card | | |

## Projects

| # | Check | Android | iOS |
|---|---|---|---|
| 52 | Project list shows "x/y tasks done" and the target date | | |
| 53 | Tapping a project opens its detail screen; back returns to the list | | |
| 54 | Quick add creates a task inside that project | | |
| 55 | Project tasks never appear in the Tasks tab, Calendar, Journal or Dashboard | | |
| 56 | All Tasks groups by Project / Due date / Status | | |
| 57 | Project calendar colours tasks by project | | |
| 58 | Project Properties saves name, colour, status, target date, description | | |
| 59 | Archiving a project removes it from the list | | |

## Calendar

| # | Check | Android | iOS |
|---|---|---|---|
| 60 | Month and Week both render; ◀ Today ▶ move the anchor | | |
| 61 | Tasks, dated goals and dated articles all appear in their colours | | |
| 62 | Period goals appear as banners for the anchor month/quarter/year | | |
| 63 | Tapping a day shows its items and quick-add creates a task on that day | | |

## Notes

| # | Check | Android | iOS |
|---|---|---|---|
| 64 | Quick capture adds a note; the list is pinned-first then newest | | |
| 65 | Search matches title and body, case-insensitively | | |
| 66 | Pin, edit and delete all work; delete confirms first | | |

## Reading

| # | Check | Android | iOS |
|---|---|---|---|
| 67 | Books and Articles tabs show their own shelves | | |
| 68 | Items sort soonest-due first, undated last | | |
| 69 | Moving to Reading stamps a start date once | | |
| 70 | Finish asks for a rating and takeaways, then files the book | | |
| 71 | Moving a finished book back clears its finish date and rating | | |
| 72 | Article links open externally | | |

## Vision board

| # | Check | Android | iOS |
|---|---|---|---|
| 73 | Long-pressing the board opens the Pin dialog at that spot | | |
| 74 | All four card types render correctly | | |
| 75 | Long-press then drag moves a card; the position survives a relaunch | | |
| 76 | A dragged card comes to the front | | |
| 77 | Goal cards show live title, horizon and progress | | |
| 78 | A card whose goal was deleted shows the warning text | | |
| 79 | List cards add and remove items | | |
| 80 | Dragging stays smooth on a mid-range Android | | |

## Settings

| # | Check | Android | iOS |
|---|---|---|---|
| 81 | Control Panel groups sections and shows item counts | | |
| 82 | Search filters sections by title, description and keyword | | |
| 83 | Categories: add with a colour, delete with confirmation | | |
| 84 | New category appears in the Goals category chips without a reload | | |
| 85 | Journal questions: add, enable/disable, delete | | |
| 86 | Custom fields: all four types, select requires options | | |
| 87 | Display: previews render in their own theme and apply on tap | | |
| 88 | Session shows the signed-in email and logs off | | |
