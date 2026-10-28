import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { parseQr, removeFcmToken, sendFcmToken } from './services/api';
import { AdderEvent, toEvent } from './services/events';
import { deleteFcmToken, getFcmToken, getInitialMessage, getNotificationPermission, onFcmTokenRefresh, onForegroundMessage, onNotificationOpen, requestNotificationPermission, RemoteMessage } from './services/notifications';

export type { AdderEvent } from './services/events';

type State = {
  endpoint: string | null;
  events: AdderEvent[];
  token: string | null;
  /** AuthorizationStatus from FCM; null until asked. */
  permission: number | null;
  busy: boolean;
  openedEvent: AdderEvent | null;
  registrationError: string | null;
  registrationPending: boolean;
  retryRegistration(): Promise<boolean>;
  link(url: string): Promise<boolean>;
  unlink(): Promise<boolean>;
};

const ENDPOINT_KEY = 'adder.endpoint';
const Ctx = createContext<State | null>(null);

function storedLink(saved: string | null) {
  let url = saved;
  let linkedAt = 0;
  if (saved?.startsWith('{')) {
    try {
      const record = JSON.parse(saved);
      url = typeof record.url === 'string' ? record.url : null;
      linkedAt = Number.isFinite(record.linkedAt) && record.linkedAt >= 0 ? record.linkedAt : 0;
    } catch { url = null; }
  }
  return { url: url ? parseQr(JSON.stringify({ apiEndpoint: url })) : null, linkedAt };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [events, setEvents] = useState<AdderEvent[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [openedEvent, setOpenedEvent] = useState<AdderEvent | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationPending, setRegistrationPending] = useState(false);
  const currentEndpoint = useRef<string | null>(null);
  const currentLinkStartedAt = useRef(0);
  const mounted = useRef(true);
  const permissionRevision = useRef(0);
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

  const receiveMessage = useCallback((message: RemoteMessage, opened: boolean, revision: number) => {
    restoring.current.then(() => {
      if (!mounted.current || changing.current || registrationBlocked.current || !currentEndpoint.current
        || endpointRevision.current !== revision
        || (message.sentTime != null && message.sentTime < currentLinkStartedAt.current)) return;
      const event = toEvent(message);
      setEvents(previous => [event, ...previous.filter(item => item.id !== event.id)]);
      if (opened) setOpenedEvent(event);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    let refreshed = false;
    const restoreRevision = endpointRevision.current;
    const initialTokenRevision = tokenRevision.current;
    const initialPermissionRevision = permissionRevision.current;
    const stopRefresh = onFcmTokenRefresh((nextToken) => {
      refreshed = true;
      if (active && !revoking.current && !revokedTokens.current.has(nextToken)) {
        currentToken.current = nextToken;
        setToken(nextToken);
      }
    });
    restoring.current = AsyncStorage.getItem(ENDPOINT_KEY).then((saved) => {
      if (!active) return;
      const link = storedLink(saved);
      currentEndpoint.current = link.url;
      currentLinkStartedAt.current = link.linkedAt;
      if (endpointRevision.current === restoreRevision) setEndpoint(link.url);
    });
    // Keep read failures available to link/unlink without an unhandled rejection.
    restoring.current.catch(() => {});
    requestNotificationPermission().then((status) => {
      if (active && permissionRevision.current === initialPermissionRevision) setPermission(status);
    }).catch(() => {});
    getFcmToken().then((initialToken) => {
      if (active && !refreshed && tokenRevision.current === initialTokenRevision) {
        currentToken.current = initialToken;
        setToken(initialToken);
      }
    }).catch(() => {
      if (active && !refreshed && tokenRevision.current === initialTokenRevision) {
        setRegistrationError('Push registration is unavailable. Check your connection and try again.');
      }
    });
    getInitialMessage().then(message => {
      if (active && message) receiveMessage(message, true, restoreRevision);
    }).catch(() => {});
    const appState = AppState.addEventListener('change', status => {
      if (status === 'active') {
        const revision = ++permissionRevision.current;
        getNotificationPermission().then(value => {
          if (active && permissionRevision.current === revision) setPermission(value);
        }).catch(() => {});
      }
    });
    return () => {
      active = false;
      mounted.current = false;
      stopRefresh();
      appState.remove();
    };
  }, []);

  useEffect(() => {
    if (busy) return;
    let active = true;
    const revision = endpointRevision.current;
    const stopMessage = onForegroundMessage(message => { if (active) receiveMessage(message, false, revision); });
    const stopOpened = onNotificationOpen(message => { if (active) receiveMessage(message, true, revision); });
    return () => {
      active = false;
      stopMessage();
      stopOpened();
    };
  }, [endpoint, busy, receiveMessage]);

  useEffect(() => {
    if (!endpoint || !token || busy || changing.current || registrationBlocked.current) return;
    let cancelled = false;
    const revision = endpointRevision.current;
    // Finish older registrations first so a slower response cannot replace a newer token.
    registration.current = registration.current.then(async () => {
      if (cancelled || changing.current || registrationBlocked.current || endpointRevision.current !== revision
        || (registered.current?.endpoint === endpoint && registered.current.token === token)) return;
      uploadedTokens.current.add(token);
      setRegistrationPending(true);
      const accepted = await sendFcmToken(endpoint, token);
      if (accepted) registered.current = { endpoint, token };
      if (endpointRevision.current === revision) {
        setRegistrationError(accepted ? null : 'Push registration failed. Check your connection and try again.');
      }
      setRegistrationPending(false);
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
    currentLinkStartedAt.current = 0;
    setEndpoint(null);
    setEvents([]);
    setOpenedEvent(null);
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
        const saved = storedLink(await AsyncStorage.getItem(ENDPOINT_KEY));
        currentEndpoint.current = saved.url;
        currentLinkStartedAt.current = saved.linkedAt;
        restoring.current = Promise.resolve();
      }
      if (endpointRevision.current !== revision) return false;

      const priorLinkedAt = currentLinkStartedAt.current;
      const replacing = url === null || currentEndpoint.current !== url || cleanupPending;
      // Rotate even on a first link, invalidating any registration from a failed prior session.
      if (replacing) {
        if (!await revokeRegistration()) return false;
      }

      if (url === null) return true;
      if (endpointRevision.current !== revision) return false;
      const linkedAt = replacing ? Date.now() : priorLinkedAt;
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
          await AsyncStorage.setItem(ENDPOINT_KEY, JSON.stringify({ url, linkedAt }));
          currentLinkStartedAt.current = linkedAt;
          registrationBlocked.current = false;
          setRegistrationError(null);
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

  const retryRegistration = useCallback((): Promise<boolean> => {
    const revision = endpointRevision.current;
    if (changing.current || registrationBlocked.current || !currentEndpoint.current) return Promise.resolve(false);
    tokenRevision.current += 1;
    const request = registration.current.then(async () => {
      if (changing.current || registrationBlocked.current || endpointRevision.current !== revision || !currentEndpoint.current) return false;
      setRegistrationPending(true);
      try {
        const fetchedToken = currentToken.current ?? await getFcmToken();
        const token = currentToken.current ?? fetchedToken;
        if (changing.current || endpointRevision.current !== revision) return false;
        currentToken.current = token;
        setToken(token);
        uploadedTokens.current.add(token);
        const endpoint = currentEndpoint.current;
        const accepted = await sendFcmToken(endpoint, token);
        if (accepted) registered.current = { endpoint, token };
        if (endpointRevision.current === revision) {
          setRegistrationError(accepted ? null : 'Push registration failed. Check your connection and try again.');
        }
        return accepted;
      } catch {
        if (endpointRevision.current === revision) setRegistrationError('Push registration is unavailable. Check your connection and try again.');
        return false;
      } finally {
        setRegistrationPending(false);
      }
    });
    registration.current = request.then(() => {});
    return request;
  }, []);

  const value = useMemo<State>(
    () => ({
      endpoint, events, token, permission, busy, openedEvent, registrationError, registrationPending, retryRegistration,
      link: changeEndpoint,
      unlink: () => changeEndpoint(null),
    }),
    [endpoint, events, token, permission, busy, openedEvent, registrationError, registrationPending, retryRegistration, changeEndpoint],
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
