import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { removeFcmToken, sendFcmToken } from './services/api';
import { deleteFcmToken, getFcmToken, onFcmTokenRefresh, onForegroundMessage, requestNotificationPermission, RemoteMessage } from './services/notifications';

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
  busy: boolean;
  link(url: string): Promise<boolean>;
  unlink(): Promise<boolean>;
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
  const [busy, setBusy] = useState(false);
  const currentEndpoint = useRef<string | null>(null);
  const currentToken = useRef<string | null>(null);
  const restoring = useRef(Promise.resolve());
  const changing = useRef(false);
  const revoking = useRef(false);
  const registrationBlocked = useRef(false);
  const uploadedTokens = useRef(new Set<string>());
  const revokedTokens = useRef(new Set<string>());
  const tokenRevision = useRef(0);
  const registered = useRef<{ endpoint: string; token: string } | null>(null);
  const registration = useRef(Promise.resolve());
  const endpointRevision = useRef(0);

  useEffect(() => {
    let active = true;
    let refreshed = false;
    const restoreRevision = endpointRevision.current;
    const initialTokenRevision = tokenRevision.current;
    const stopRefresh = onFcmTokenRefresh((nextToken) => {
      refreshed = true;
      if (active && !revoking.current && !revokedTokens.current.has(nextToken)) {
        currentToken.current = nextToken;
        setToken(nextToken);
      }
    });
    restoring.current = AsyncStorage.getItem(ENDPOINT_KEY).then((saved) => {
      if (!active) return;
      currentEndpoint.current = saved;
      if (endpointRevision.current === restoreRevision) setEndpoint(saved);
    });
    // Keep read failures available to link/unlink without an unhandled rejection.
    restoring.current.catch(() => {});
    requestNotificationPermission().then((status) => {
      if (active) setPermission(status);
    }).catch(() => {});
    getFcmToken().then((initialToken) => {
      if (active && !refreshed && tokenRevision.current === initialTokenRevision) {
        currentToken.current = initialToken;
        setToken(initialToken);
      }
    }).catch(() => {});
    const stopMessage = onForegroundMessage((m) => setEvents((prev) => [toEvent(m), ...prev]));
    return () => {
      active = false;
      stopRefresh();
      stopMessage();
    };
  }, []);

  useEffect(() => {
    if (!endpoint || !token || busy || changing.current || registrationBlocked.current) return;
    let cancelled = false;
    const revision = endpointRevision.current;
    // Finish older registrations first so a slower response cannot replace a newer token.
    registration.current = registration.current.then(async () => {
      if (cancelled || changing.current || registrationBlocked.current || endpointRevision.current !== revision
        || (registered.current?.endpoint === endpoint && registered.current.token === token)) return;
      uploadedTokens.current.add(token);
      if (await sendFcmToken(endpoint, token)) registered.current = { endpoint, token };
    });
    return () => { cancelled = true; };
  }, [endpoint, token, busy]);

  const revokeRegistration = useCallback(async (): Promise<boolean> => {
    let removed = true;
    if (currentEndpoint.current) {
      // A refresh may arrive while an older token's POST is still in flight.
      const tokens = new Set(uploadedTokens.current);
      if (registered.current?.endpoint === currentEndpoint.current) tokens.add(registered.current.token);
      if (currentToken.current) tokens.add(currentToken.current);
      if (!tokens.size) tokens.add(await getFcmToken());
      for (const oldToken of tokens) {
        if (!await removeFcmToken(currentEndpoint.current, oldToken)) removed = false;
      }
      for (const oldToken of tokens) revokedTokens.current.add(oldToken);
    }
    if (currentToken.current) revokedTokens.current.add(currentToken.current);
    revoking.current = true;
    try { await deleteFcmToken(); } finally { revoking.current = false; }
    currentToken.current = null;
    setToken(null);
    // Keep the cleanup target and block automatic uploads until an explicit retry.
    if (!removed) return false;
    registered.current = null;
    uploadedTokens.current.clear();
    await AsyncStorage.removeItem(ENDPOINT_KEY);
    currentEndpoint.current = null;
    setEndpoint(null);
    setEvents([]);
    return true;
  }, []);

  const changeEndpoint = useCallback((url: string | null): Promise<boolean> => {
    const revision = ++endpointRevision.current;
    const cleanupPending = registrationBlocked.current;
    tokenRevision.current += 1;
    changing.current = true;
    registrationBlocked.current = true;
    setBusy(true);
    const request = registration.current.then(async () => {
      try { await restoring.current; } catch {
        currentEndpoint.current = await AsyncStorage.getItem(ENDPOINT_KEY);
        restoring.current = Promise.resolve();
      }
      if (endpointRevision.current !== revision) return false;

      // Rotate even on a first link, invalidating any registration from a failed prior session.
      if (url === null || currentEndpoint.current !== url || cleanupPending) {
        if (!await revokeRegistration()) return false;
      }

      if (url === null) return true;
      if (endpointRevision.current !== revision) return false;
      const fetchedToken = currentToken.current ?? await getFcmToken();
      const linkingToken = currentToken.current ?? fetchedToken;
      currentToken.current = linkingToken;
      setToken(linkingToken);
      if (endpointRevision.current !== revision) return false;
      // Track attempts too: the server can accept a POST whose response is lost.
      registered.current = { endpoint: url, token: linkingToken };
      uploadedTokens.current.add(linkingToken);
      currentEndpoint.current = url;
      try {
        const accepted = await sendFcmToken(url, linkingToken);
        if (endpointRevision.current !== revision) return false;
        if (accepted) {
          await AsyncStorage.setItem(ENDPOINT_KEY, url);
          registrationBlocked.current = false;
          return true;
        }
      } catch {
        // An accepted registration must also be revoked if saving its endpoint fails.
      }
      await revokeRegistration();
      return false;
    }).catch(() => false).finally(() => {
      revoking.current = false;
      if (endpointRevision.current === revision) {
        setEndpoint(currentEndpoint.current);
        changing.current = false;
        setBusy(false);
      }
    });
    registration.current = request.then(() => {});
    return request;
  }, [revokeRegistration]);

  const value = useMemo<State>(
    () => ({
      endpoint, events, token, permission, busy,
      link: changeEndpoint,
      unlink: () => changeEndpoint(null),
    }),
    [endpoint, events, token, permission, busy, changeEndpoint],
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
