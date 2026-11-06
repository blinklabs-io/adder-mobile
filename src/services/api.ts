import { getFcmToken } from './notifications';

/** QR payload: `{"apiEndpoint": "https://host/path"}`. Returns the normalized HTTPS URL or null. */
export function parseQr(text: string): string | null {
  try {
    const { apiEndpoint } = JSON.parse(text);
    if (typeof apiEndpoint !== 'string' || !apiEndpoint) return null;
    const url = new URL(/^\w+:\/\//.test(apiEndpoint) ? apiEndpoint : `https://${apiEndpoint}`);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** POSTs `{fcmToken}` to `url`; server replies 201 on success. */
export async function sendFcmToken(url: string, token?: string): Promise<boolean> {
  try {
    const fcmToken = token ?? await getFcmToken();
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

/** DELETEs `/fcm/{token}`; an absent registration is already deregistered. */
export async function removeFcmToken(endpoint: string, token: string): Promise<boolean> {
  try {
    const url = new URL(endpoint);
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodeURIComponent(token)}`;
    const res = await fetch(url.toString(), { method: 'DELETE' });
    return res.status === 204 || res.status === 404;
  } catch {
    return false;
  }
}
