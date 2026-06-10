# Step 3: React.memo, Scroll Debounce, Mobile Layout Fixes

**Status: DONE**

## Changes Applied

### Part A: TopBar scroll debounce + React.memo
**File:** `src/components/layout/TopBar.tsx`

- Replaced raw scroll listener with `requestAnimationFrame` throttling (`ticking` flag pattern).
- Wrapped component in `React.memo` to prevent unnecessary re-renders from parent re-renders.
- Removed stale `eslint-disable-next-line` directive (no longer needed).
- `LanguageToggle` was already imported and rendered — no changes needed.

```ts
// Scroll debounce using requestAnimationFrame
useEffect(() => {
  let ticking = false
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        ticking = false
      })
      ticking = true
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

```tsx
// React.memo wrapper
export const TopBar = React.memo(function TopBar() {
```

### Part B: BottomNav React.memo
**File:** `src/components/layout/BottomNav.tsx`

- Wrapped component in `React.memo`.
- Added `useCallback` to `handlePrefetch` to stabilize the memoized component.

```tsx
export const BottomNav = React.memo(function BottomNav() {
  const handlePrefetch = useCallback((to: string) => { ... }, [qc])
```

### Part C: FanZonePage mobile layout
**File:** `src/pages/fanzone/FanZonePage.tsx`

- Sidebars now hidden on mobile, visible only at `lg` breakpoint.
- On mobile, sidebars are rendered in a separate stacked section below the feed.

```tsx
<aside className="hidden lg:flex flex-col gap-4 sticky top-[68px]">
  <WatchPartiesSidebar />
  <TribesSidebar />
</aside>

{/* Mobile: sidebars stacked below feed */}
<div className="lg:hidden mt-2 flex flex-col gap-4">
  <WatchPartiesSidebar />
  <TribesSidebar />
</div>
```

### Part D: LanguageToggle
**File:** `src/components/ui/LanguageToggle.tsx` + `src/components/layout/TopBar.tsx`

- `LanguageToggle` was already fully implemented and imported in TopBar.
- No changes needed.

## Verification Results

| Check | Result |
|-------|--------|
| `grep -q 'React.memo' src/components/layout/TopBar.tsx` | OK |
| `grep -q 'throttle\|debounce\|requestAnimationFrame' src/components/layout/TopBar.tsx` | OK |
| `grep -q 'React.memo' src/components/layout/BottomNav.tsx` | OK |
| `npm run lint` | 0 errors |
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | success |