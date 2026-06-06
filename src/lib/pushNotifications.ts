// src/lib/pushNotifications.ts
// Subscribe / unsubscribe helpers for browser Web Push.
// Wire these to the toggle in src/components/profile/SettingsModal.tsx.

import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Convert a base64 VAPID public key string to a Uint8Array backed by a plain
 * ArrayBuffer (not SharedArrayBuffer) so it satisfies the PushManager API's
 * BufferSource constraint.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer  = new ArrayBuffer(rawData.length)
  const output  = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

/** Check if the browser supports everything we need. */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/** Returns the current push subscription, or null if not subscribed. */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  try {
    const reg = await navigator.serviceWorker.ready
    return await reg.pushManager.getSubscription()
  } catch {
    return null
  }
}

// --------------------------------------------------------------------------
// Subscribe
// Requests permission, creates a PushSubscription, then writes it directly
// to the push_subscriptions table via the Supabase client.
// --------------------------------------------------------------------------

export async function subscribeToAlerts(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('[pushNotifications] Push not supported in this browser.')
    return false
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('[pushNotifications] Notification permission denied.')
    return false
  }

  const reg = await navigator.serviceWorker.ready

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const json   = subscription.toJSON()
  const keys   = json.keys as { p256dh: string; auth: string }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id:  userId,
        endpoint: subscription.endpoint,
        p256dh:   keys.p256dh,
        auth:     keys.auth,
      },
      { onConflict: 'user_id,endpoint' },
    )

  if (error) {
    console.error('[pushNotifications] Failed to save subscription:', error.message)
    return false
  }

  return true
}

// --------------------------------------------------------------------------
// Unsubscribe
// Unsubscribes from the browser PushManager and removes the row from
// push_subscriptions.
// --------------------------------------------------------------------------

export async function unsubscribeFromAlerts(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false

  const subscription = await getCurrentSubscription()
  if (!subscription) return true

  await subscription.unsubscribe()

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', subscription.endpoint)

  if (error) {
    console.warn('[pushNotifications] Failed to remove subscription:', error.message)
  }

  return true
}

// --------------------------------------------------------------------------
// Convenience: check if currently subscribed
// --------------------------------------------------------------------------

export async function isSubscribed(): Promise<boolean> {
  const sub = await getCurrentSubscription()
  return sub !== null
}