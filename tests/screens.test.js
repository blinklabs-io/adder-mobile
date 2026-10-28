const React = require('react');
const { act, create } = require('react-test-renderer');

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', Modal: 'Modal', ActivityIndicator: 'ActivityIndicator',
    Alert: { alert: jest.fn() }, Linking: { openSettings: jest.fn() },
    useWindowDimensions: () => ({ width: 390, height: 844 }), StyleSheet: { absoluteFill: {} },
    Animated: { Value: class { setValue() {} }, View: 'AnimatedView', timing: () => ({ start() {} }) },
    FlatList: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ scrollToOffset() {} }));
      return React.createElement('FlatList', props, props.ListHeaderComponent,
        ...props.data.map((item, index) => React.createElement(React.Fragment, { key: item.id }, props.renderItem({ item, index }))));
    }),
  };
});
jest.mock('../src/components/ui', () => Object.fromEntries(
  ['Body', 'Display', 'Icon', 'Mono', 'SectionHeader', 'Empty', 'Button'].map(name => [name, props => require('react').createElement(name, props)]),
));
jest.mock('../src/theme', () => ({
  useTheme: () => ({ paper: '#fff', ink: '#222', accent: '#713F25' }),
  useReducedMotion: () => true, timeAgo: () => 'just now', radii: { card: 22 }, space: { s: 8, m: 12, l: 20, xl: 32 },
}));
jest.mock('../src/store', () => ({
  useApp: jest.fn(), AppProvider: ({ children }) => children, hostOf: value => new URL(value).host,
}));
jest.mock('../src/components/TabBar', () => props => require('react').createElement('TabBar', props));
jest.mock('expo-blur', () => ({ BlurTargetView: 'BlurTargetView' }));
jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock('expo-camera', () => ({ CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, jest.fn()] }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), NotificationFeedbackType: { Success: 'success', Error: 'error' } }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('../src/services/notifications', () => ({ AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: -1, NOT_DETERMINED: 0 } }));
jest.mock('../src/services/api', () => ({ parseQr: text => { try { return JSON.parse(text).apiEndpoint; } catch { return null; } } }));

const { useApp } = require('../src/store');
const { Linking } = require('react-native');
const App = require('../App').default;
const Feed = require('../src/screens/FeedScreen').default;
const Settings = require('../src/screens/SettingsScreen').default;
const Scan = require('../src/screens/ScanScreen').default;
global.IS_REACT_ACT_ENVIRONMENT = true;
let root, state;
const event = { id: 'tx-1', title: 'Transaction', body: 'Confirmed', receivedAt: 1000, messages: ['Invoice 42', 'Paid in ADA'], data: { metadata: '{raw}' } };
const button = title => root.root.findAllByType('Button').find(node => node.props.title === title);
beforeEach(() => {
  root = null;
  state = { endpoint: 'https://adder.example.com/fcm', token: 'token', permission: -1, busy: false,
    events: [event], openedEvent: null, registrationError: null, registrationPending: false,
    retryRegistration: jest.fn().mockResolvedValue(true), link: jest.fn(), unlink: jest.fn().mockResolvedValue(true) };
  useApp.mockImplementation(() => state);
  Linking.openSettings.mockResolvedValue();
  jest.spyOn(console, 'error').mockImplementation(message => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw new Error(message);
  });
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('CIP20 messages render as readable selectable text and a notification tap expands raw event data', async () => {
  state.openedEvent = event;
  await act(async () => { root = create(React.createElement(Feed, { onScan() {}, bottomClearance: 100 })); });
  expect(root.root.findAllByType('Body').some(node => node.props.selectable && node.props.children === 'Invoice 42\nPaid in ADA')).toBe(true);
  expect(root.root.findAllByType('Pressable').some(node => node.props.accessibilityLabel?.includes('Transaction message: Invoice 42\nPaid in ADA'))).toBe(true);
  expect(root.root.findAllByType('Mono').some(node => node.props.children === '{raw}')).toBe(true);
});

test('notification opening switches Settings to Feed and dismisses the scanner', async () => {
  await act(async () => { root = create(React.createElement(App)); });
  await act(async () => { root.root.findByType('TabBar').props.onChange('settings'); });
  const scan = root.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel === 'Scan a new QR code');
  await act(async () => { scan.props.onPress(); });
  expect(root.root.findByType('Modal').props.visible).toBe(true);
  state = { ...state, openedEvent: event };
  await act(async () => { root.update(React.createElement(App)); });
  expect(root.root.findByType('TabBar').props.tab).toBe('feed');
  expect(root.root.findByType('Modal').props.visible).toBe(false);
});

test('Settings provides notification settings recovery and an explicit registration retry', async () => {
  state.registrationError = 'Push registration failed.';
  await act(async () => { root = create(React.createElement(Settings, { onScan() {}, bottomClearance: 100 })); });
  await act(async () => { await button('Open notification settings').props.onPress(); });
  expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  await act(async () => { await button('Retry registration').props.onPress(); });
  expect(state.retryRegistration).toHaveBeenCalledTimes(1);
});

test('scanner retries the same endpoint after a failed request without rescanning', async () => {
  state.link.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const close = jest.fn();
  await act(async () => { root = create(React.createElement(Scan, { onClose: close })); });
  await act(async () => { await root.root.findByType('CameraView').props.onBarcodeScanned({ data: JSON.stringify({ apiEndpoint: state.endpoint }) }); });
  await act(async () => { await button('Try again').props.onPress(); });
  expect(state.link.mock.calls).toEqual([[state.endpoint], [state.endpoint]]);
  expect(close).toHaveBeenCalledTimes(1);
});
