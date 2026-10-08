const React = require('react');
const { act, create } = require('react-test-renderer');

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(),
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
const postedTokens = () => global.fetch.mock.calls.map(([url, options]) => [url, JSON.parse(options.body).fcmToken]);

beforeEach(() => {
  jest.clearAllMocks();
  root = null;
  refresh = undefined;
  stopRefresh = jest.fn();
  stopMessage = jest.fn();
  storage.getItem.mockResolvedValue(endpoint);
  storage.setItem.mockResolvedValue();
  storage.removeItem.mockResolvedValue();
  messaging.getToken.mockResolvedValue('current-token');
  messaging.requestPermission.mockResolvedValue(1);
  messaging.onTokenRefresh.mockImplementation((_, callback) => { refresh = callback; return stopRefresh; });
  messaging.onMessage.mockReturnValue(stopMessage);
  global.fetch = jest.fn().mockResolvedValue({ status: 201 });
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
  await act(async () => { state.unlink(); });
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
  global.fetch.mockResolvedValue({ status: 500 });
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
  await act(async () => { state.unlink(); });
  await act(async () => { restoreEndpoint(endpoint); });
  expect(state.endpoint).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('a delayed startup restore cannot replace a newly linked endpoint', async () => {
  let restoreEndpoint;
  storage.getItem.mockReturnValue(new Promise(resolve => { restoreEndpoint = resolve; }));
  await mount();
  const newEndpoint = 'https://new-adder.example.com/register';
  await act(async () => { await state.link(newEndpoint); });
  await act(async () => { restoreEndpoint(endpoint); });
  expect(state.endpoint).toBe(newEndpoint);
  expect(postedTokens()).toEqual([[newEndpoint, 'current-token']]);
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
  await act(async () => { state.unlink(); });
  await act(async () => { finishManualRegistration({ status: 201 }); await linking; });
  expect(state.endpoint).toBeNull();
  expect(storage.setItem).not.toHaveBeenCalled();
});
