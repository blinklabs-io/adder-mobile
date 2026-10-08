import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { sendFcmToken } from './services/api';
import { getFcmToken, onFcmTokenRefresh, onForegroundMessage, requestNotificationPermission, RemoteMessage } from './services/notifications';

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
  const registered = useRef<{ endpoint: string; token: string } | null>(null);
  const registration = useRef(Promise.resolve());
  const endpointRevision = useRef(0);

  useEffect(() => {
    let active = true;
    let refreshed = false;
    const restoreRevision = endpointRevision.current;
    const stopRefresh = onFcmTokenRefresh((nextToken) => {
      refreshed = true;
      if (active) setToken(nextToken);
    });
    AsyncStorage.getItem(ENDPOINT_KEY).then((saved) => {
      if (active && endpointRevision.current === restoreRevision) setEndpoint(saved);
    }).catch(() => {});
    requestNotificationPermission().then((status) => {
      if (active) setPermission(status);
    }).catch(() => {});
    getFcmToken().then((initialToken) => {
      if (active && !refreshed) setToken(initialToken);
    }).catch(() => {});
    const stopMessage = onForegroundMessage((m) => setEvents((prev) => [toEvent(m), ...prev]));
    return () => {
      active = false;
      stopRefresh();
      stopMessage();
    };
  }, []);

  useEffect(() => {
    if (!endpoint || !token) return;
    let cancelled = false;
    // Finish older registrations first so a slower response cannot replace a newer token.
    registration.current = registration.current.then(async () => {
      if (cancelled || (registered.current?.endpoint === endpoint && registered.current.token === token)) return;
      if (await sendFcmToken(endpoint, token)) registered.current = { endpoint, token };
    });
    return () => { cancelled = true; };
  }, [endpoint, token]);

  const value = useMemo<State>(
    () => ({
      endpoint, events, token, permission,
      async link(url) {
        const linkRevision = endpointRevision.current;
        let currentToken = token;
        if (!currentToken) {
          try { currentToken = await getFcmToken(); } catch { return false; }
        }
        const linkingToken = currentToken;
        const request = registration.current.then(async () => {
          if (endpointRevision.current !== linkRevision) return false;
          const ok = await sendFcmToken(url, linkingToken);
          if (endpointRevision.current !== linkRevision) return false;
          if (ok) registered.current = { endpoint: url, token: linkingToken };
          return ok;
        });
        registration.current = request.then(() => {});
        const ok = await request;
        if (ok) {
          endpointRevision.current += 1;
          setToken((current) => current ?? linkingToken);
          setEndpoint(url);
          await AsyncStorage.setItem(ENDPOINT_KEY, url);
        }
        return ok;
      },
      unlink() {
        endpointRevision.current += 1;
        registered.current = null;
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
