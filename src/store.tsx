import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { sendFcmToken } from './services/api';
import { getFcmToken, onForegroundMessage, requestNotificationPermission, RemoteMessage } from './services/notifications';

export type AdderEvent = {
  id: string;
  title: string;
  body?: string;
  data: Record<string, string>;
  receivedAt: number;
};

type State = {
  endpoint: string | null;
  events: AdderEvent[];
  token: string | null;
  /** AuthorizationStatus from FCM; null until asked. */
  permission: number | null;
  link(url: string): Promise<boolean>;
  unlink(): void;
};

const ENDPOINT_KEY = 'adder.endpoint';
const Ctx = createContext<State | null>(null);

function toEvent(m: RemoteMessage): AdderEvent {
  const data = Object.fromEntries(
    Object.entries(m.data ?? {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
  );
  return {
    id: m.messageId ?? String(m.sentTime ?? Date.now()),
    title: m.notification?.title ?? data.type ?? 'Event',
    body: m.notification?.body,
    data,
    receivedAt: Date.now(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [events, setEvents] = useState<AdderEvent[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ENDPOINT_KEY).then(setEndpoint);
    requestNotificationPermission().then(setPermission);
    getFcmToken().then(setToken).catch(() => {});
    return onForegroundMessage((m) => setEvents((prev) => [toEvent(m), ...prev]));
  }, []);

  const value = useMemo<State>(
    () => ({
      endpoint, events, token, permission,
      async link(url) {
        const ok = await sendFcmToken(url);
        if (ok) {
          setEndpoint(url);
          await AsyncStorage.setItem(ENDPOINT_KEY, url);
        }
        return ok;
      },
      unlink() {
        setEndpoint(null);
        AsyncStorage.removeItem(ENDPOINT_KEY);
      },
    }),
    [endpoint, events, token, permission],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

export function hostOf(url: string) {
  try { return new URL(url).host || url; } catch { return url; }
}
