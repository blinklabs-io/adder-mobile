import { getFcmToken } from './notifications';

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(url, { ...options, signal: controller.signal }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('Request timed out'));
        }, 15000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

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
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken }),
    });
    return res.status === 201;
  } catch {
    return false;
  }
}

/** DELETEs `/fcm/{token}`; an absent registration is already deregistered. */
export async function removeFcmToken(endpoint: string, token: string): Promise<boolean> {
  try {
    const url = new URL(endpoint);
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodeURIComponent(token)}`;
    const res = await fetchWithTimeout(url.toString(), { method: 'DELETE' });
    return res.status === 204 || res.status === 404;
  } catch {
    return false;
  }
}
