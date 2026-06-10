# Step 3 Summary — Auth Robustness & Profile Performance

## Part A: EditProfileModal Avatar Race Condition

### Problem
- `onClose` was called immediately in `handleSave` regardless of mutation state
- Close button, backdrop click, and Escape key were never disabled during upload/edit
- If user closed modal mid-upload, mutation completed silently and UI never reflected new avatar

### Fix (src/components/profile/EditProfileModal.tsx — extracted from ProfilePage.tsx)

1. **Modal CANNOT be closed while busy**: close button has `disabled={busy}`, backdrop `onClick` is `busy ? undefined : onClose`, avatar button is disabled during upload, username input disabled during save

2. **onClose called AFTER mutation completes**: `handleSave` now uses `updateProfile(..., { onSuccess: () => onClose() })` so modal only closes after the server confirms the update

3. **Loading indicator during upload**: spinner overlay on avatar button when `uploading === true`

4. **Button text shows current state**: "Uploading..." when uploading, "Saving..." when saving

5. **Component extracted**: `EditProfileModal` moved from inline definition in `ProfilePage.tsx` to its own file at `src/components/profile/EditProfileModal.tsx` (exported as named export)

### Files modified
- `src/components/profile/EditProfileModal.tsx` — **created** (fixes applied)
- `src/pages/profile/ProfilePage.tsx` — inline component removed, import added, imports cleaned up (`useRef`, `useUpdateProfile`, `useUploadAvatar` removed from page-level imports)

### Verification
```bash
grep -q 'disabled.*isLoading\|isUploading' src/components/profile/EditProfileModal.tsx  # PASS
```

---

## Part B: BadgeGrid Empty State

### Problem
- New users with zero rows in `passport_badges` saw "No badges yet" message
- No visibility into which badges are available to earn

### Fix (src/components/profile/BadgeGrid.tsx)

1. **Added DEFAULT_BADGES array** with 8 static badge definitions:
   - `first_login` — "First Steps" — Log in for the first time — icon: `login`
   - `first_post` — "New Voice" — Create your first post — icon: `campaign`
   - `first_prediction` — "Crystal Ball" — Make your first match prediction — icon: `psychology`
   - `first_review` — "Critic" — Submit your first stadium review — icon: `rate_review`
   - `ten_posts` — "Influencer" — Create 10 posts — icon: `trending_up`
   - `correct_prediction` — "Nostradamus" — Get a prediction right — icon: `emoji_events`
   - `tribe_member` — "Tribal" — Join a tribe — icon: `groups`
   - `watch_party_host` — "Host" — Create a watch party — icon: `co_present`

2. **Added mergeWithDefaults()** function: merges fetched badges with defaults. Unlocked badges from DB take precedence; missing badges are synthesized as locked rows with label/description filled in from `DEFAULT_BADGES`.

3. **ICON_MAP extended** with entries for all 8 new badge keys

4. **BadgeGrid renders mergedBadges** instead of raw `badges` prop

5. **ProfilePage badges tab simplified**: removed empty-state branch entirely — `BadgeGrid` always renders since it now includes locked defaults. Counter updated to show "X of 8 unlocked".

### Files modified
- `src/components/profile/BadgeGrid.tsx` — `DEFAULT_BADGES`, `mergeWithDefaults()`, extended `ICON_MAP`, `mergedBadges` usage
- `src/pages/profile/ProfilePage.tsx` — badges tab no longer has empty-state branch, uses `badges ?? []` with fixed "of 8" counter

### Verification
```bash
grep -q 'first_login\|first_post' src/components/profile/BadgeGrid.tsx  # PASS
```

---

## All Verifications Passed

| Check | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | success (1.9s) |
| `grep 'disabled.*isLoading\|isUploading' EditProfileModal.tsx` | PASS |
| `grep 'first_login\|first_post' BadgeGrid.tsx` | PASS |