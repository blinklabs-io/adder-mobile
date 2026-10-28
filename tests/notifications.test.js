jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
  PermissionsAndroid: { request: jest.fn(), check: jest.fn(), PERMISSIONS: { POST_NOTIFICATIONS: 'post-notifications' }, RESULTS: { GRANTED: 'granted' } },
}));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: () => ({}), requestPermission: jest.fn(), hasPermission: jest.fn(),
  AuthorizationStatus: { AUTHORIZED: 1, DENIED: -1 },
}));
const { Platform, PermissionsAndroid } = require('react-native');
const firebase = require('@react-native-firebase/messaging');
const { requestNotificationPermission, getNotificationPermission } = require('../src/services/notifications');

beforeEach(() => { jest.resetAllMocks(); Platform.OS = 'android'; Platform.Version = 33; });

test.each([['granted', 1], ['denied', -1], ['never_ask_again', -1]])('Android 13+ permission %s maps to %i', async (result, expected) => {
  PermissionsAndroid.request.mockResolvedValue(result);
  expect(await requestNotificationPermission()).toBe(expected);
  expect(PermissionsAndroid.request).toHaveBeenCalledWith('post-notifications');
  expect(firebase.requestPermission).not.toHaveBeenCalled();
});

test('Android resume checks the OS permission without showing another prompt', async () => {
  PermissionsAndroid.check.mockResolvedValue(false);
  expect(await getNotificationPermission()).toBe(-1);
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});

test('iOS uses the Firebase permission APIs', async () => {
  Platform.OS = 'ios';
  firebase.requestPermission.mockResolvedValue(1);
  firebase.hasPermission.mockResolvedValue(-1);
  expect(await requestNotificationPermission()).toBe(1);
  expect(await getNotificationPermission()).toBe(-1);
});

test('older Android checks system notification status instead of assuming authorization', async () => {
  Platform.Version = 32;
  firebase.hasPermission.mockResolvedValue(-1);
  firebase.requestPermission.mockResolvedValue(1);
  expect(await requestNotificationPermission()).toBe(-1);
  expect(firebase.requestPermission).not.toHaveBeenCalled();
});
