# Fix stadium images & fan-zone issues

## Issues
1. **Stadium images don't persist on navigation** — `StadiumCard` uses `loading="lazy"`; in a React Router SPA, lazy-loaded images re-inserted into the viewport after navigation often fail to trigger the browser's IntersectionObserver, so they never load until a hard reload.
2. **Fan-zone Watch Parties sidebar redundant** — `/events` page now exists; the `WatchPartiesSidebar` in `/fan-zone` is duplicated functionality.
3. **Fan-zone hashtags clutter the top** — Remove the hashtag chips above the feed filter.
4. **Fan-zone slow loading** — Removing `WatchPartiesSidebar` eliminates an extra Supabase query + realtime subscriptions, improving initial load.

## Changes

### Chunk 1 — StadiumCard image loading
**File:** `src/components/stadiums/StadiumCard.tsx`
- Change `loading={priority ? 'eager' : 'lazy'}` → `loading="eager"` on the `<img>` element.
- Rationale: only 16 stadium images total; eager loading is negligible overhead and guarantees images render immediately when the component mounts, avoiding the SPA lazy-loading bug.

### Chunk 2 — FanZonePage cleanup
**File:** `src/pages/fanzone/FanZonePage.tsx`
- Remove `WatchPartiesSidebar` import.
- Remove `HASHTAGS` constant array.
- Remove the JSX block that renders hashtag chips (`<div className="flex flex-wrap gap-2">...</div>`).
- Remove `<WatchPartiesSidebar />` from the desktop `<aside>` and the mobile stacked `<div>`.
- Remove `hashtags={HASHTAGS}` prop from `<PostComposer />` (the component defaults to `[]` so no prop is fine).

## Acceptance criteria
- [ ] Stadium images render immediately when navigating to `/stadiums` without requiring a page reload.
- [ ] Stadium images still render when navigating away from `/stadiums` and then back.
- [ ] `/fan-zone` no longer shows the "Watch Parties" sidebar.
- [ ] `/fan-zone` no longer shows the hashtag chips above the feed filter.
- [ ] `/fan-zone` still loads posts, shows tribes sidebar, and the post composer works.
