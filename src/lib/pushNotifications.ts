// src/lib/pushNotifications.ts
// Subscribe / unsubscribe helpers for browser Web Push.
// Wire these to the toggle in src/components/profile/SettingsModal.tsx.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Convert a base64 VAPID public key string to a Uint8Array backed by a plain
 * ArrayBuffer (not SharedArrayBuffer) so it satisfies the PushManager API's
 * BufferSource constraint.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  // Allocate a plain ArrayBuffer explicitly — avoids SharedArrayBuffer mismatch.
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Check if the browser supports everything we need. */
export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Returns the current push subscription, or null if not subscribed. */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Subscribe
// --------------------------------------------------------------------------

export async function subscribeToAlerts(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn("[pushNotifications] Push not supported in this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("[pushNotifications] Notification permission denied.");
    return false;
  }

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast ensures TypeScript sees ArrayBuffer, not ArrayBufferLike
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, subscription }),
  });

  if (!res.ok) {
    console.error(
      "[pushNotifications] Failed to register subscription on server.",
      res.status
    );
    return false;
  }

  return true;
}

// --------------------------------------------------------------------------
// Unsubscribe
// --------------------------------------------------------------------------

export async function unsubscribeFromAlerts(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  const subscription = await getCurrentSubscription();
  if (!subscription) return true;

  await subscription.unsubscribe();

  const res = await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, endpoint: subscription.endpoint }),
  });

  if (!res.ok) {
    console.warn(
      "[pushNotifications] Failed to remove subscription from server.",
      res.status
    );
  }

  return true;
}

// --------------------------------------------------------------------------
// Convenience: check if currently subscribed
// --------------------------------------------------------------------------

export async function isSubscribed(): Promise<boolean> {
  const sub = await getCurrentSubscription();
  return sub !== null;
}