import type { RemoteMessage } from '@react-native-firebase/messaging';

export type AdderEvent = {
  id: string;
  title: string;
  body?: string;
  originalBody?: string;
  data: Record<string, string>;
  messages: string[];
  receivedAt: number;
};

function utf8Length(text: string) {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code >= 0xd800 && code <= 0xdfff) return Infinity;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}

function cip20Messages(value: unknown): string[] {
  try {
    if (typeof value === 'string') {
      if (value.length > 16384) return [];
      value = JSON.parse(value);
    }
    if (!value || typeof value !== 'object' || !('674' in value)) return [];
    const metadata = value['674'];
    if (!metadata || typeof metadata !== 'object' || 'enc' in metadata || !('msg' in metadata)) return [];
    const messages = metadata.msg;
    return Array.isArray(messages) && messages.every(line => typeof line === 'string' && utf8Length(line) <= 64)
      ? messages : [];
  } catch {
    return [];
  }
}

export function toEvent(message: RemoteMessage): AdderEvent {
  const data = Object.fromEntries(
    Object.entries(message.data ?? {}).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
  );
  let body = message.notification?.body;
  let originalBody: string | undefined;
  let messages = cip20Messages(data.metadata);
  const marker = body?.lastIndexOf('\nMetadata: ') ?? -1;
  if (marker >= 0) {
    const rawMetadata = body!.slice(marker + '\nMetadata: '.length);
    const legacyMessages = cip20Messages(rawMetadata);
    if (legacyMessages.length) {
      if (!messages.length) messages = legacyMessages;
      if (data.metadata && data.metadata !== rawMetadata) originalBody = body;
      else data.metadata = rawMetadata;
      body = body!.slice(0, marker);
    }
  }
  return {
    id: message.messageId ?? JSON.stringify([
      message.sentTime ?? null, message.notification?.title ?? null, message.notification?.body ?? null,
      Object.keys(data).sort().map(key => [key, data[key]]),
    ]),
    title: message.notification?.title ?? data.type ?? 'Event',
    body,
    originalBody,
    data,
    messages,
    receivedAt: Date.now(),
  };
}
