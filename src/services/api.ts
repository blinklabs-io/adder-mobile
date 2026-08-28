import { getFcmToken } from './notifications';

/** QR payload: `{"apiEndpoint": "https://host/path"}`. Returns the normalized URL or null. */
export function parseQr(text: string): string | null {
  try {
    const { apiEndpoint } = JSON.parse(text);
    if (typeof apiEndpoint !== 'string' || !apiEndpoint) return null;
    return /^https?:\/\//.test(apiEndpoint) ? apiEndpoint : `https://${apiEndpoint}`;
  } catch {
    return null;
  }
}

/** POSTs `{fcmToken}` to `url`; server replies 201 on success. */
export async function sendFcmToken(url: string): Promise<boolean> {
  try {
    const fcmToken = await getFcmToken();
    console.log('FCM token', fcmToken, '->', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken }),
    });
    if (res.status !== 201) console.log('Failed to send FCM token. Status:', res.status);
    return res.status === 201;
  } catch (e) {
    console.log('Error sending FCM token:', e);
    return false;
  }
}
