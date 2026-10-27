jest.mock('expo', () => ({ registerRootComponent: jest.fn() }));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  setBackgroundMessageHandler: jest.fn(),
}));
jest.mock('../App', () => ({ __esModule: true, default: jest.fn() }));

test('registers a background handler that keeps notification contents out of device logs', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    require('../index');
    const { setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
    const { registerRootComponent } = require('expo');
    expect(setBackgroundMessageHandler).toHaveBeenCalledTimes(1);
    expect(setBackgroundMessageHandler.mock.invocationCallOrder[0])
      .toBeLessThan(registerRootComponent.mock.invocationCallOrder[0]);
    await setBackgroundMessageHandler.mock.calls[0][1]({
      notification: { title: 'Private title', body: 'Private body' },
      data: { secret: 'Private payload' },
    });
    expect(log).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
