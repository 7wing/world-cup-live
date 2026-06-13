# World Cup Live — Agent QA Checklist (`agents.md`)

> **Purpose:** This document is the kimchi QA agent spec. Each section describes what the agent must verify, what "good" looks like, and what bugs to flag. Work top-to-bottom; each section is independent.

---

## 1. Match Detail Page (`/matches/:matchId`)

### 1a. Stats Visibility — 2022 Matches

**What to check:**
- Navigate to every 2022 World Cup match (already completed games).
- On the Stats tab, confirm **all stat bars are populated and visible**: possession %, shots on/off target, corners, fouls, yellow/red cards, offsides, passes, saves.
- Stats must not be hidden behind a loading skeleton indefinitely.
- Values must be non-zero and reflect actual historical data (not placeholders like `0 – 0` across the board).

**Pass criteria:**
- All stat rows render with real numbers for both teams.
- No "Stats unavailable" or empty state shown for completed 2022 matches.

**Fail / flag:**
- Stats tab missing or not rendering its content.

---

### 1b. Hide "Predict" Tab for 2022 Matches

**What to check:**
- For every match where `match.year === 2022` (or `match.status === "completed"` / result is already decided), confirm the **Predict tab is not rendered** in the Match Detail tab bar.
- The tab must be completely absent from the DOM — not just disabled or grayed out.

**Pass criteria:**
- Tab bar on 2022 match detail shows: Overview, Stats, Lineups, H2H, Live Chat — but **no Predict tab**.

**Fail / flag:**
- Predict tab visible (even if non-functional) on any completed 2022 match.

---

### 1c. "Seeding Pending" Notice for 2026 Matches

**What to check:**
- For upcoming 2026 matches where teams/seedings are not yet confirmed (e.g., knockout-stage slots like "Winner Group A vs Runner-up Group B"):
  - The match detail page must display a notice: **"This will be confirmed when the games start"** (or equivalent friendly copy).
  - This notice should appear in place of or alongside unconfirmed team names/lineups.

**Implementation note (from kimchi ferment spec):**
- Seeding logic was documented in the ferment — group winners/runners-up feed into the bracket. Until those slots are resolved, display the placeholder notice.
- The Predict tab **can** remain visible for upcoming 2026 matches (predictions are valid before kickoff).

**Pass criteria:**
- Unconfirmed 2026 bracket matches show the "will be confirmed" notice clearly.
- Confirmed 2026 matches (teams known) do NOT show this notice.

**Fail / flag:**
- Unconfirmed match slots showing `undefined`, blank, or raw slot codes (e.g., `W49`) without a human-readable notice.

---

## 2. Fan Zone (`/fan-zone` and sub-routes)

### 2a. Post Composer — Create a Post

**What to check:**
- Logged-in user can open the post composer.
- Type text, optionally select a hashtag chip.
- Submit the post.
- Post appears immediately in the feed (optimistic update or fast refresh).

**Pass criteria:**
- Post visible in feed within ~1s of submission.
- Hashtag chip correctly appended to post content.
- Character/length limits enforced if applicable.

**Fail / flag:**
- Submit button does nothing.
- Post appears then disappears (optimistic rollback on no error).
- No feedback (loading state, success toast, or error message) after submission.

---

### 2b. Feed Filters — All / Trending / Following

**What to check:**
- Clicking each filter tab updates the feed.
- "Following" filter only shows posts from users the current user follows.
- "Trending" shows posts sorted by engagement (likes/comments), not just chronological.
- "All" shows the full unfiltered feed.

**Pass criteria:**
- Each tab produces a visibly different feed result (or an empty state with explanation if no data).
- Filter persists on scroll (infinite scroll doesn't reset the filter).

**Fail / flag:**
- All three tabs show identical content.
- "Following" tab shows posts from strangers.
- Switching tabs throws a console error.

---

### 2c. Likes

**What to check:**
- Tapping the like button on a post increments the count (optimistic update).
- Tapping again removes the like (toggle).
- Refreshing the page persists the like state.

**Pass criteria:**
- Like count updates instantly (optimistic).
- Like state survives page reload.

**Fail / flag:**
- Double-liking is possible (count goes up twice on rapid tap).
- Like count reverts to 0 after reload.

---

### 2d. Watch Parties Sidebar + `/fan-zone/watch-party/:partyId`

**What to check (sidebar):**
- Watch Parties sidebar on `/fan-zone` lists active/upcoming parties.
- User can click a party to navigate to `/fan-zone/watch-party/:partyId`.

**What to check (party page):**
- Party page loads without error for a valid `partyId`.
- Live chat is functional: user can send a message and see it appear.
- Match/party metadata is displayed (which match, host, participant count).
- Join button (if not already a member) works and updates the participant count.

**Pass criteria:**
- Full create → join → chat flow works end-to-end for a watch party.

**Fail / flag:**
- `/fan-zone/watch-party/:partyId` returns a 404 or blank page.
- Chat input is present but messages don't send.
- Join action has no effect on participant count.

---

### 2e. Tribes Sidebar + `/fan-zone/tribes`

**What to check:**
- Tribes sidebar on `/fan-zone` lists tribes with names and member counts.
- "Browse All" or equivalent navigates to `/fan-zone/tribes`.
- `/fan-zone/tribes` renders a full list/grid of tribes — searchable or filterable.

**Pass criteria:**
- At least sample tribes are displayed.
- Clicking a tribe navigates to `/tribes/:tribeId`.

**Fail / flag:**
- Tribes list is empty with no empty-state explanation.
- Navigation to `/tribes/:tribeId` breaks.

---

### 2f. Tribe Detail (`/tribes/:tribeId`)

**What to check:**
- Page loads for a valid `tribeId`.
- Displays tribe name, description, member count, and member list.
- **Join Tribe** button works for a non-member — user joins, count increments, button changes to "Leave" or "Member."
- **Leave Tribe** works symmetrically.
- Tribe chat (if present) is functional — messages send and appear.
- Creating a new tribe (from `/fan-zone/tribes`) works: name, description, submit → navigates to new tribe page.

**Pass criteria:**
- Full create → join → chat → leave flow works.

**Fail / flag:**
- Join button present but non-functional.
- Creating a tribe throws an error or navigates nowhere.
- Tribe chat shows messages from other users but own messages don't appear.

---

## 3. Games Page (`/games`)

> **Core issue flagged:** Games are not interactive. Each tab must be fully playable by a real user. Agent must verify all four tabs.

---

### 3a. AI Trivia Tab

**What to check:**
- Tab loads and calls the Gemini `generate-trivia` edge function.
- A question is displayed with multiple-choice answer options.
- User selects an answer → receives correct/incorrect feedback with explanation.
- Next question loads after answer.
- Score/XP is tracked and displayed during the session.
- Session ends after N questions with a summary screen.

**Pass criteria:**
- Full trivia round (min 5 questions) completable without errors.
- XP awarded matches the displayed reward.

**Fail / flag:**
- Questions never load (edge function timeout or missing API key).
- Answer selection has no effect (no feedback rendered).
- Score does not update after correct answer.
- "Play Again" / "Next" button missing or broken.

---

### 3b. Predictor Tab

**What to check:**
- Lists upcoming 2026 matches that haven't kicked off yet.
- User can input an exact score for home and away teams (e.g., 2–1).
- Submitting a prediction locks it in (input disabled after submission for that match).
- XP reward is shown on submission.
- Previously submitted predictions are displayed (with locked state) on revisit.

**Pass criteria:**
- At least one upcoming match is predictable end-to-end.
- Prediction persists after page reload.
- 2022 / completed matches do NOT appear in this list.

**Fail / flag:**
- Match list is empty (no upcoming games shown).
- Score input accepts invalid values (negative numbers, letters).
- Submission appears to succeed but prediction is gone on reload.
- Completed matches appear in the predictor.

---

### 3c. Bracket Tab

**What to check:**
- Knockout bracket is displayed with all 16 teams / slots.
- User can click on a match and pick a winner.
- Picking a winner advances that team to the next round in the bracket UI.
- Full bracket can be filled out to the Final.
- Bracket is saveable — persists across sessions.

**Pass criteria:**
- Complete bracket fill-out from Round of 16 → Final without UI errors.
- Saved bracket is restored on next visit.

**Fail / flag:**
- Bracket renders but picks have no effect on subsequent rounds.
- Bracket resets to empty on page reload.
- Clicking a match throws a JS error.

---

### 3d. Fan Duel Tab (1v1 Trivia)

**What to check:**
- User can initiate a duel challenge (invite a friend or join matchmaking).
- Duel lobby shows while waiting for opponent.
- Once matched, both players see the same question simultaneously.
- First to answer correctly scores the point.
- Duel ends after N rounds with a winner declared.
- XP awarded to winner.

**Pass criteria:**
- At minimum, a solo "practice duel" or bot duel mode is playable if no opponent is available.
- Live duel (two browser tabs / two accounts) works: questions sync, winner is declared correctly.

**Fail / flag:**
- "Challenge" button present but no matchmaking happens.
- Duel lobby spins indefinitely (no timeout/fallback).
- Questions are out of sync between the two players.
- Winner screen never appears (duel loops or crashes).

---

## General Agent Notes

- **Auth state:** Run all checks in both **logged-in** and **guest** (logged-out) modes. Guest-mode restrictions should be enforced gracefully (prompt to log in, not a blank screen or crash).
- **Console errors:** Flag any `console.error` or unhandled promise rejections encountered during any flow above.
- **Mobile responsiveness:** Spot-check each page at 390px width. Flag any overflow, broken layout, or unclickable buttons.
- **Empty states:** Every list/feed must have a meaningful empty state (not a blank white screen) when data is absent.
- **Loading states:** Every async fetch must show a skeleton or spinner — never a blank section.

---

*Last updated: 2026-06-11 | Owner: kimchi QA agent*