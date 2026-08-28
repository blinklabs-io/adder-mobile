import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';

const messaging = getMessaging();

export { AuthorizationStatus };
export type { RemoteMessage };

export function requestNotificationPermission() {
  return requestPermission(messaging);
}

export function onForegroundMessage(cb: (m: RemoteMessage) => void) {
  return onMessage(messaging, async (m) => cb(m));
}

export function getFcmToken() {
  return getToken(messaging);
}
