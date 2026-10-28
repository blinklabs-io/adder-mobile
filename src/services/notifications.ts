import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getInitialNotification,
  getToken,
  hasPermission,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  requestPermission,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

const messaging = getMessaging();

export { AuthorizationStatus };
export type { RemoteMessage };

export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED ? AuthorizationStatus.AUTHORIZED : AuthorizationStatus.DENIED;
  }
  if (Platform.OS === 'android') return hasPermission(messaging);
  return requestPermission(messaging);
}

export async function getNotificationPermission() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const allowed = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return allowed ? AuthorizationStatus.AUTHORIZED : AuthorizationStatus.DENIED;
  }
  return hasPermission(messaging);
}

export function onNotificationOpen(cb: (message: RemoteMessage) => void) {
  return onNotificationOpenedApp(messaging, cb);
}

export function getInitialMessage() {
  return getInitialNotification(messaging);
}

export function onForegroundMessage(cb: (m: RemoteMessage) => void) {
  return onMessage(messaging, async (m) => cb(m));
}

export function getFcmToken() {
  return getToken(messaging);
}

export function deleteFcmToken() {
  return deleteToken(messaging);
}

export function onFcmTokenRefresh(cb: (token: string) => void) {
  return onTokenRefresh(messaging, cb);
}
