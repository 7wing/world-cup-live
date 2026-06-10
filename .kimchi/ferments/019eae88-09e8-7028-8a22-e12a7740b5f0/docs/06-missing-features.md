# Phase 6: Missing Features & Polish

## Overview
Implement 3 missing pages (Discover, Messages, Tribe Detail) and wire them into the router + navigation.

## Files to create

### `src/pages/profile/DiscoverPage.tsx` (new)
- Searchable list of all users (excluding current logged-in user)
- Each user: avatar, username, tier, "Add Friend" button
- "Add Friend" inserts a `friendships` row with `status: 'pending'`
- Search input at top to filter by username
- Uses: GlassCard, Avatar, PageWrapper, useQuery, useSendFriendRequest
- Lazy-load in router

### `src/pages/profile/MessagesPage.tsx` (new)
- Two-panel DM interface: conversation list (left) + thread (right)
- Fetch from `direct_messages` table
- Supabase Realtime subscription for incoming messages
- Input field to send messages
- Schema: `id uuid, sender_id uuid, receiver_id uuid, content text, read_at timestamptz, created_at timestamptz`
- Note: Requires `direct_messages` table to be created via SUPABASE.md SQL

### `src/pages/fanzone/TribeDetailPage.tsx` (new)
- Route: `/tribes/:tribeId`
- Tribe info: name, badge, member count, total points
- Member list: tribe_members joined with users
- Posts table has NO `tribe_id` column — show tribe info + members only
- Uses: GlassCard, Avatar, existing patterns

### `src/api/profile.ts` — add functions
- `fetchAllUsers(excludeId?: string): Promise<User[]>`
- `fetchConversations(userId: string): Promise<Conversation[]>`
- `fetchDirectMessages(userId: string, partnerId: string): Promise<DirectMessage[]>`
- `sendDirectMessage(senderId: string, receiverId: string, content: string): Promise<void>`
- `markDmRead(messageId: string): Promise<void>`

### `src/api/fanzone.ts` — add functions
- `fetchTribeById(tribeId: string): Promise<Tribe>`
- `fetchTribeMembers(tribeId: string): Promise<TribeMemberUser[]>`

### `src/types/index.ts` — add types
```ts
export interface DirectMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read_at: string | null
  created_at: string
}

export interface Conversation {
  partner_id: string
  partner: User
  last_message: DirectMessage | null
  unread_count: number
}

export interface TribeMemberUser {
  user_id: string
  user?: User
  role: string | null
  joined_at: string
}
```

### `src/router/index.tsx` — wire routes
```tsx
const DiscoverPage   = React.lazy(() => import('@/pages/profile/DiscoverPage').then(m => ({ default: m.DiscoverPage })))
const MessagesPage   = React.lazy(() => import('@/pages/profile/MessagesPage').then(m => ({ default: m.MessagesPage })))
const TribeDetailPage = React.lazy(() => import('@/pages/fanzone/TribeDetailPage').then(m => ({ default: m.TribeDetailPage })))

{ path: 'discover', element: <DiscoverPage /> },
{ path: 'messages', element: <MessagesPage /> },
{ path: 'messages/:userId', element: <MessagesPage /> },
{ path: 'tribes/:tribeId', element: <TribeDetailPage /> },
```

### `src/components/layout/TopBar.tsx` — add nav links
- Add DiscoverPlayers nav link to `/discover`
- Add Messages nav link to `/messages`
- Import and place LanguageToggle next to profile avatar

### `src/pages/profile/ProfilePage.tsx` — ensure Message button links to `/messages/:userId`
- Already has: `<NeonButton ... onClick={() => navigate(`/messages/${userId}`)}>` - OK

### `src/pages/fanzone/TribesPage.tsx` — ensure tribe names link to `/tribes/:tribeId`
- Wrap tribe names/avatars with navigate on click to `/tribes/${tribe.id}`

## LanguageToggle
- File already exists at `src/components/ui/LanguageToggle.tsx`
- Import in TopBar.tsx and place next to profile avatar
- Note: uses inline styles — will style with Tailwind to match the dark theme

## Verification
1. `npm run lint` → 0 errors
2. `npx tsc --noEmit` → 0 errors
3. `npm run build` → success
4. Routes wired: `/discover`, `/messages`, `/tribes/:tribeId`