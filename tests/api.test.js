jest.mock('../src/services/notifications', () => ({ getFcmToken: jest.fn() }));
const { removeFcmToken } = require('../src/services/api');

beforeEach(() => { global.fetch = jest.fn(); });

test.each([204, 404])('deregistration accepts HTTP %i without logging the token', async (status) => {
  global.fetch.mockResolvedValue({ status });
  expect(await removeFcmToken('https://adder.example.com/v1/fcm/?key=value', 'token:/+?'))
    .toBe(true);
  expect(global.fetch).toHaveBeenCalledWith(
    'https://adder.example.com/v1/fcm/token%3A%2F%2B%3F?key=value',
    { method: 'DELETE' },
  );
});

test('deregistration reports server failure', async () => {
  global.fetch.mockResolvedValue({ status: 500 });
  expect(await removeFcmToken('https://adder.example.com/v1/fcm', 'token')).toBe(false);
});

test('deregistration reports network failure without exposing the token-bearing URL', async () => {
  global.fetch.mockRejectedValue(new Error('https://adder.example.com/v1/fcm/private-token'));
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    expect(await removeFcmToken('https://adder.example.com/v1/fcm', 'private-token')).toBe(false);
    expect(log).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
