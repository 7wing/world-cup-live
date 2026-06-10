# Step 2: Service Worker for Push Notifications

## Status: Done

## Changes

### `public/sw.js`
Already existed with a complete implementation:
- `install` listener: `self.skipWaiting()`
- `activate` listener: `event.waitUntil(clients.claim())`
- `push` listener: shows a browser notification with title, body, icon, badge, tag, url, actions, vibrate, requireInteraction
- `notificationclick` listener: closes notification, focuses existing tab or opens new window to target URL
- `pushsubscriptionchange` listener: re-subscribes and POSTs to `/api/push/resubscribe`

### `src/lib/pushNotifications.ts`
Added `registerServiceWorker()` function:
```ts
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch (err) {
    console.error('[pushNotifications] SW registration failed:', err)
    return null
  }
}
```
Updated `subscribeToAlerts` to call `registerServiceWorker()` first, using the returned registration instead of `navigator.serviceWorker.ready`.

### `src/main.tsx`
Added import and early call:
```ts
import { registerServiceWorker } from '@/lib/pushNotifications'

registerServiceWorker().catch(() => {})
```

## Verification
- `npm run lint` → 0 errors
- `npx tsc --noEmit` → 0 errors (no output = success)
- `npm run build` → success, `dist/sw.js` present
- `test -f /home/blueclouds/workspace/github/7wing/world-cup-live/public/sw.js` → success