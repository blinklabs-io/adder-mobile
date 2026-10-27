const React = require('react');
const { act, create } = require('react-test-renderer');

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(),
  deleteToken: jest.fn(),
  onTokenRefresh: jest.fn(),
  onMessage: jest.fn(),
  requestPermission: jest.fn(),
}));

const storage = require('@react-native-async-storage/async-storage');
const messaging = require('@react-native-firebase/messaging');
const { AppProvider, useApp } = require('../src/store');

global.IS_REACT_ACT_ENVIRONMENT = true;
const endpoint = 'https://adder.example.com/register';
let state, root, refresh, stopRefresh, stopMessage;
function Probe() { state = useApp(); return null; }
async function mount() {
  await act(async () => { root = create(React.createElement(AppProvider, null, React.createElement(Probe))); });
}
const postedTokens = () => global.fetch.mock.calls
  .filter(([, options]) => options.method === 'POST')
  .map(([url, options]) => [url, JSON.parse(options.body).fcmToken]);
const deletedTokens = () => global.fetch.mock.calls
  .filter(([, options]) => options.method === 'DELETE').map(([url]) => url);

beforeEach(() => {
  jest.resetAllMocks();
  root = null;
  refresh = undefined;
  stopRefresh = jest.fn();
  stopMessage = jest.fn();
  storage.getItem.mockResolvedValue(endpoint);
  storage.setItem.mockResolvedValue();
  storage.removeItem.mockResolvedValue();
  messaging.getToken.mockResolvedValue('current-token');
  messaging.deleteToken.mockResolvedValue();
  messaging.requestPermission.mockResolvedValue(1);
  messaging.onTokenRefresh.mockImplementation((_, callback) => { refresh = callback; return stopRefresh; });
  messaging.onMessage.mockReturnValue(stopMessage);
  global.fetch = jest.fn().mockImplementation(async (_, options) => ({
    status: options.method === 'DELETE' ? 204 : 201,
  }));
  // React 19 deprecates this renderer; it still exercises provider effects without a device.
  jest.spyOn(console, 'error').mockImplementation((message) => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw new Error(message);
  });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(async () => {
  if (root) await act(async () => { root.unmount(); });
  jest.restoreAllMocks();
});

test('registers the current token after restoring a saved endpoint', async () => {
  await mount();
  expect(state.endpoint).toBe(endpoint);
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
});

test('uploads the token supplied by a refresh and updates Settings state', async () => {
  await mount();
  expect(refresh).toEqual(expect.any(Function));
  await act(async () => { refresh('rotated-token'); });
  expect(state.token).toBe('rotated-token');
  expect(postedTokens()).toEqual([[endpoint, 'current-token'], [endpoint, 'rotated-token']]);
});

test('keeps a refresh received before endpoint restoration and the initial token read finish', async () => {
  let restoreEndpoint, initialToken;
  storage.getItem.mockReturnValue(new Promise(resolve => { restoreEndpoint = resolve; }));
  messaging.getToken.mockReturnValue(new Promise(resolve => { initialToken = resolve; }));
  await mount();
  expect(refresh).toEqual(expect.any(Function));
  await act(async () => { refresh('newest-token'); });
  await act(async () => { initialToken('old-token'); restoreEndpoint(endpoint); });
  expect(state.token).toBe('newest-token');
  expect(postedTokens()).toEqual([[endpoint, 'newest-token']]);
});

test('does not register tokens when there is no linked endpoint', async () => {
  storage.getItem.mockResolvedValue(null);
  await mount();
  expect(refresh).toEqual(expect.any(Function));
  await act(async () => { refresh('rotated-token'); });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('stops automatic uploads after unlinking', async () => {
  await mount();
  expect(refresh).toEqual(expect.any(Function));
  await act(async () => { await state.unlink(); });
  global.fetch.mockClear();
  await act(async () => { refresh('rotated-token'); });
  expect(state.endpoint).toBeNull();
  expect(storage.removeItem).toHaveBeenCalledWith('adder.endpoint');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('retains the endpoint after a failed registration and retries on the next refresh', async () => {
  global.fetch.mockRejectedValueOnce(new Error('offline'));
  await mount();
  expect(state.endpoint).toBe(endpoint);
  expect(refresh).toEqual(expect.any(Function));
  await act(async () => { refresh('retry-token'); });
  expect(postedTokens()).toEqual([[endpoint, 'current-token'], [endpoint, 'retry-token']]);
});

test('cleans up both Firebase subscriptions on unmount', async () => {
  await mount();
  await act(async () => { root.unmount(); });
  root = null;
  expect(stopRefresh).toHaveBeenCalledTimes(1);
  expect(stopMessage).toHaveBeenCalledTimes(1);
});

test('manual linking persists the endpoint only after the server accepts it', async () => {
  storage.getItem.mockResolvedValue(null);
  await mount();
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(true);
  expect(state.endpoint).toBe(endpoint);
  expect(storage.setItem).toHaveBeenCalledWith('adder.endpoint', endpoint);
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
});

test('a rejected manual link leaves the app unlinked', async () => {
  storage.getItem.mockResolvedValue(null);
  global.fetch.mockResolvedValueOnce({ status: 500 });
  await mount();
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(false);
  expect(state.endpoint).toBeNull();
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('a delayed startup restore cannot undo a newer unlink', async () => {
  let restoreEndpoint;
  storage.getItem.mockReturnValue(new Promise(resolve => { restoreEndpoint = resolve; }));
  await mount();
  let unlinking;
  await act(async () => { unlinking = state.unlink(); });
  await act(async () => { restoreEndpoint(endpoint); await unlinking; });
  expect(state.endpoint).toBeNull();
  expect(postedTokens()).toEqual([]);
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
});

test('a delayed startup restore cannot replace a newly linked endpoint', async () => {
  let restoreEndpoint;
  storage.getItem.mockReturnValue(new Promise(resolve => { restoreEndpoint = resolve; }));
  await mount();
  const newEndpoint = 'https://new-adder.example.com/register';
  let linking;
  await act(async () => { linking = state.link(newEndpoint); });
  messaging.getToken.mockResolvedValue('replacement-token');
  await act(async () => { restoreEndpoint(endpoint); await linking; });
  expect(state.endpoint).toBe(newEndpoint);
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
  expect(postedTokens()).toEqual([[newEndpoint, 'replacement-token']]);
});

test('finishes an older registration before uploading a rotated token', async () => {
  let finishOldRegistration;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishOldRegistration = resolve; }));
  await mount();
  await act(async () => { refresh('newest-token'); });
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
  await act(async () => { finishOldRegistration({ status: 201 }); });
  expect(postedTokens()).toEqual([[endpoint, 'current-token'], [endpoint, 'newest-token']]);
});

test('a pending manual relink cannot overwrite a newer token registration', async () => {
  await mount();
  let finishManualRegistration, linking;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishManualRegistration = resolve; }));
  await act(async () => { linking = state.link(endpoint); });
  await act(async () => { refresh('newest-token'); });
  // The latest token must reach the server after the pending old-token POST.
  expect(postedTokens()).toEqual([[endpoint, 'current-token'], [endpoint, 'current-token']]);
  await act(async () => { finishManualRegistration({ status: 201 }); await linking; });
  expect(postedTokens().at(-1)).toEqual([endpoint, 'newest-token']);
  expect(state.token).toBe('newest-token');
});

test('a pending manual link cannot undo a later unlink', async () => {
  await mount();
  let finishManualRegistration, linking;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishManualRegistration = resolve; }));
  await act(async () => { linking = state.link(endpoint); });
  let unlinking;
  await act(async () => { unlinking = state.unlink(); });
  await act(async () => { finishManualRegistration({ status: 201 }); await linking; await unlinking; });
  expect(state.endpoint).toBeNull();
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
});

test('unlink waits for server deregistration and Firebase revocation before clearing local state', async () => {
  await mount();
  let finishDeletion, unlinking;
  messaging.deleteToken.mockReturnValueOnce(new Promise(resolve => { finishDeletion = resolve; }));
  await act(async () => { unlinking = state.unlink(); });
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  expect(state.endpoint).toBe(endpoint);
  expect(state.busy).toBe(true);
  expect(storage.removeItem).not.toHaveBeenCalled();
  let result;
  await act(async () => { finishDeletion(); result = await unlinking; });
  expect(result).toBe(true);
  expect(state.endpoint).toBeNull();
  expect(state.token).toBeNull();
  expect(state.busy).toBe(false);
  expect(storage.removeItem).toHaveBeenCalledWith('adder.endpoint');
});

test('a failed server deregistration keeps the link for retry', async () => {
  await mount();
  global.fetch.mockResolvedValueOnce({ status: 500 });
  let result;
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(false);
  expect(state.endpoint).toBe(endpoint);
  expect(state.busy).toBe(false);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  expect(storage.removeItem).not.toHaveBeenCalled();
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(true);
  expect(state.endpoint).toBeNull();
});

test('a failed Firebase revocation keeps the link for retry', async () => {
  await mount();
  messaging.deleteToken.mockRejectedValueOnce(new Error('offline'));
  let result;
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(false);
  expect(state.endpoint).toBe(endpoint);
  expect(storage.removeItem).not.toHaveBeenCalled();
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(true);
});

test('a storage failure after revocation reports failure without uploading another token', async () => {
  await mount();
  storage.removeItem.mockRejectedValueOnce(new Error('storage unavailable'));
  let result;
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(false);
  expect(state.endpoint).toBe(endpoint);
  expect(state.token).toBeNull();
  await act(async () => { refresh('fresh-but-unlinked-token'); });
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
  await act(async () => { result = await state.unlink(); });
  expect(result).toBe(true);
});

test('replacing an endpoint revokes the previous service before registering a fresh token', async () => {
  await mount();
  messaging.getToken.mockResolvedValue('replacement-token');
  const replacement = 'https://replacement.example.com/fcm';
  let result;
  await act(async () => { result = await state.link(replacement); });
  expect(result).toBe(true);
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  const replacementPost = global.fetch.mock.calls.findIndex(([url, options]) => url === replacement && options.method === 'POST');
  expect(messaging.deleteToken.mock.invocationCallOrder[0])
    .toBeLessThan(global.fetch.mock.invocationCallOrder[replacementPost]);
  expect(postedTokens()).toEqual([[endpoint, 'current-token'], [replacement, 'replacement-token']]);
  expect(state.endpoint).toBe(replacement);
  expect(state.token).toBe('replacement-token');
});

test('replacing an endpoint stops when revocation fails', async () => {
  await mount();
  global.fetch.mockResolvedValueOnce({ status: 500 });
  let result;
  await act(async () => { result = await state.link('https://replacement.example.com/fcm'); });
  expect(result).toBe(false);
  expect(state.endpoint).toBe(endpoint);
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
  expect(storage.removeItem).not.toHaveBeenCalled();
});

test('a rejected replacement leaves the previous service revoked and the app unlinked', async () => {
  await mount();
  messaging.getToken.mockResolvedValue('replacement-token');
  global.fetch.mockResolvedValueOnce({ status: 204 }).mockResolvedValueOnce({ status: 500 });
  let result;
  await act(async () => { result = await state.link('https://replacement.example.com/fcm'); });
  expect(result).toBe(false);
  expect(state.endpoint).toBeNull();
  expect(deletedTokens()).toContain(`${endpoint}/current-token`);
  expect(deletedTokens()).toContain('https://replacement.example.com/fcm/replacement-token');
  expect(messaging.deleteToken).toHaveBeenCalledTimes(2);
  expect(storage.setItem).not.toHaveBeenCalled();
  await act(async () => { refresh('later-token'); });
  expect(postedTokens()).toHaveLength(2);
});

test('refreshes during revocation cannot upload to the service being unlinked', async () => {
  await mount();
  let finishDeletion, unlinking;
  messaging.deleteToken.mockReturnValueOnce(new Promise(resolve => { finishDeletion = resolve; }));
  await act(async () => { unlinking = state.unlink(); });
  await act(async () => { refresh('revocation-race-token'); });
  await act(async () => { finishDeletion(); await unlinking; });
  expect(state.endpoint).toBeNull();
  expect(state.token).toBeNull();
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
});

test('a late initial token read cannot resurrect a revoked token', async () => {
  let initialToken;
  messaging.getToken.mockReturnValueOnce(new Promise(resolve => { initialToken = resolve; }));
  await mount();
  await act(async () => { await state.unlink(); });
  await act(async () => { initialToken('revoked-token'); });
  expect(state.endpoint).toBeNull();
  expect(state.token).toBeNull();
  expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  expect(postedTokens()).toEqual([]);
});

test('unlink waits for an in-flight automatic registration and revokes it', async () => {
  let finishRegistration, unlinking;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishRegistration = resolve; }));
  await mount();
  await act(async () => { unlinking = state.unlink(); });
  expect(deletedTokens()).toEqual([]);
  await act(async () => { finishRegistration({ status: 201 }); await unlinking; });
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  expect(state.endpoint).toBeNull();
});

test('an accepted first link superseded by unlink is still revoked', async () => {
  storage.getItem.mockResolvedValue(null);
  await mount();
  let finishRegistration, linking, unlinking;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishRegistration = resolve; }));
  await act(async () => { linking = state.link(endpoint); });
  await act(async () => { unlinking = state.unlink(); });
  let linked;
  await act(async () => { finishRegistration({ status: 201 }); linked = await linking; await unlinking; });
  expect(linked).toBe(false);
  expect(deletedTokens()).toEqual([`${endpoint}/current-token`]);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(2);
  expect(state.endpoint).toBeNull();
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('a failed endpoint save rolls back the accepted server and Firebase registration', async () => {
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockRejectedValueOnce(new Error('storage unavailable'));
  await mount();
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(false);
  expect(deletedTokens()).toContain(`${endpoint}/current-token`);
  expect(messaging.deleteToken).toHaveBeenCalled();
  expect(state.endpoint).toBeNull();
  expect(state.token).toBeNull();
});

test('an ambiguous POST response revokes the token the server may have accepted', async () => {
  storage.getItem.mockResolvedValue(null);
  await mount();
  global.fetch.mockRejectedValueOnce(new Error('response lost after server accepted'));
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(false);
  expect(deletedTokens()).toContain(`${endpoint}/current-token`);
  expect(state.endpoint).toBeNull();
  expect(state.token).toBeNull();
});

test('failed rollback keeps its destination available for cleanup without automatic uploads', async () => {
  storage.getItem.mockResolvedValue(null);
  await mount();
  global.fetch.mockResolvedValueOnce({ status: 500 }).mockResolvedValueOnce({ status: 500 });
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(false);
  expect(state.endpoint).toBe(endpoint);
  expect(state.token).toBeNull();
  await act(async () => { refresh('later-token'); });
  expect(postedTokens()).toEqual([[endpoint, 'current-token']]);
  await act(async () => { await state.unlink(); });
  expect(state.endpoint).toBeNull();
});

test('unlink removes the uploaded token when a refresh races an in-flight POST', async () => {
  let finishRegistration, unlinking;
  global.fetch.mockImplementationOnce(() => new Promise(resolve => { finishRegistration = resolve; }));
  await mount();
  await act(async () => { refresh('new-token'); unlinking = state.unlink(); });
  await act(async () => { finishRegistration({ status: 201 }); await unlinking; });
  expect(deletedTokens()).toContain(`${endpoint}/current-token`);
  expect(state.endpoint).toBeNull();
});

test('replacement ignores an old refresh while acquiring the post-revocation token', async () => {
  await mount();
  let finishTokenRead, linking;
  messaging.getToken.mockReturnValueOnce(new Promise(resolve => { finishTokenRead = resolve; }));
  const replacement = 'https://replacement.example.com/fcm';
  await act(async () => { linking = state.link(replacement); });
  await act(async () => { refresh('current-token'); });
  await act(async () => { finishTokenRead('fresh-token'); await linking; });
  expect(postedTokens().at(-1)).toEqual([replacement, 'fresh-token']);
  expect(state.token).toBe('fresh-token');
});

test('a transient endpoint restore failure can be retried before changing destinations', async () => {
  storage.getItem.mockRejectedValueOnce(new Error('temporary storage error'));
  await mount();
  let unlinked;
  await act(async () => { unlinked = await state.unlink(); });
  expect(unlinked).toBe(true);
  expect(storage.getItem).toHaveBeenCalledTimes(2);
  expect(deletedTokens()).toContain(`${endpoint}/current-token`);
});

test('a late startup token cannot replace a manually acquired token', async () => {
  storage.getItem.mockResolvedValue(null);
  let initialToken;
  messaging.getToken.mockReturnValueOnce(new Promise(resolve => { initialToken = resolve; }));
  await mount();
  messaging.getToken.mockResolvedValue('fresh-token');
  await act(async () => { await state.link(endpoint); });
  await act(async () => { initialToken('stale-initial-token'); });
  expect(state.token).toBe('fresh-token');
  expect(postedTokens()).toEqual([[endpoint, 'fresh-token']]);
});

test('replacement retains a newer valid refresh received during the fresh token read', async () => {
  await mount();
  let finishTokenRead, linking;
  messaging.getToken.mockReturnValueOnce(new Promise(resolve => { finishTokenRead = resolve; }));
  const replacement = 'https://replacement.example.com/fcm';
  await act(async () => { linking = state.link(replacement); });
  await act(async () => { refresh('fresh-token-2'); });
  await act(async () => { finishTokenRead('fresh-token-1'); await linking; });
  expect(postedTokens().at(-1)).toEqual([replacement, 'fresh-token-2']);
  expect(state.token).toBe('fresh-token-2');
});

test('retrying the same endpoint after failed unlink finishes cleanup before relinking', async () => {
  await mount();
  storage.removeItem.mockRejectedValueOnce(new Error('temporary storage error'));
  await act(async () => { await state.unlink(); });
  await act(async () => { refresh('fresh-token'); });
  let linked;
  await act(async () => { linked = await state.link(endpoint); });
  expect(linked).toBe(true);
  expect(messaging.deleteToken).toHaveBeenCalledTimes(2);
  expect(storage.removeItem).toHaveBeenCalledTimes(2);
});

test('unlink removes every attempted automatic registration after ambiguous responses', async () => {
  await mount();
  global.fetch.mockRejectedValueOnce(new Error('response lost'));
  await act(async () => { refresh('accepted-but-response-lost'); });
  await act(async () => { refresh('later-token'); });
  await act(async () => { await state.unlink(); });
  expect(deletedTokens()).toContain(`${endpoint}/accepted-but-response-lost`);
});
