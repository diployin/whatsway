import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

let firebaseApp: FirebaseApp | null = null;
let messaging: any = null;

export function initFirebase(config: any) {
  // if Firebase already initialized
  if (getApps().length > 0) {
    // reuse existing instance
    firebaseApp = getApps()[0];
    messaging = getMessaging(firebaseApp);
    return { firebaseApp, messaging };
  }

  // FIRST TIME initialize
  firebaseApp = initializeApp(config);
  messaging = getMessaging(firebaseApp);

  return { firebaseApp, messaging };
}

export async function getFcmToken(vapidKey: string) {
  if (!messaging) return null;

  try {
    return await getToken(messaging, { vapidKey });
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}
