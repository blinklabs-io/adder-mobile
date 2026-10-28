const { toEvent } = require('../src/services/events');

const metadata = { '674': { msg: ['Invoice 42', 'Paid in ADA'] } };

test('reads canonical CIP20 metadata carried as an FCM JSON string', () => {
  const event = toEvent({ messageId: 'tx-1', data: { metadata: JSON.stringify(metadata) } });
  expect(event.messages).toEqual(['Invoice 42', 'Paid in ADA']);
  expect(JSON.parse(event.data.metadata)).toEqual(metadata);
});

test('reads the current server notification body and keeps raw metadata available', () => {
  const event = toEvent({
    messageId: 'tx-2',
    notification: { title: 'Adder', body: `New Transaction!\nHash: abc\nMetadata: ${JSON.stringify(metadata)}` },
  });
  expect(event.messages).toEqual(['Invoice 42', 'Paid in ADA']);
  expect(event.body).toBe('New Transaction!\nHash: abc');
  expect(JSON.parse(event.data.metadata)).toEqual(metadata);
});

test.each([
  undefined, '{broken', 'null', '[]', '{}',
  JSON.stringify({ '674': { msg: 'wrong type' } }),
  JSON.stringify({ '674': { msg: ['valid', 12] } }),
  JSON.stringify({ '674': { msg: ['a'.repeat(65)] } }),
  JSON.stringify({ '674': { msg: ['😀'.repeat(17)] } }),
  JSON.stringify({ '674': { enc: 'basic', msg: ['ciphertext'] } }),
])('ignores malformed, oversized, or encrypted CIP20 metadata: %s', (value) => {
  expect(toEvent({ data: value === undefined ? {} : { metadata: value } }).messages).toEqual([]);
});

test('preserves Unicode, line breaks, and text that resembles markup as plain strings', () => {
  const msg = ['😀'.repeat(16), '안녕하세요', '<script>alert(1)</script>', ''];
  const event = toEvent({ data: { metadata: { '674': { msg } } } });
  expect(event.messages).toEqual(msg);
});

test('leaves an unreadable legacy metadata suffix intact instead of dropping event content', () => {
  const body = 'New Transaction!\nMetadata: {truncated';
  const event = toEvent({ notification: { body } });
  expect(event.body).toBe(body);
  expect(event.messages).toEqual([]);
});

test('fallback identifiers distinguish different payloads sharing a timestamp', () => {
  expect(toEvent({ sentTime: 1000, notification: { body: 'one' } }).id)
    .not.toBe(toEvent({ sentTime: 1000, notification: { body: 'two' } }).id);
});

test('fallback identifiers remain stable across a delayed tap without message IDs or timestamps', () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
  const first = toEvent({ notification: { body: 'same message' }, data: { b: '2', a: '1' } });
  now.mockReturnValue(2000);
  const opened = toEvent({ notification: { body: 'same message' }, data: { a: '1', b: '2' } });
  expect(opened.id).toBe(first.id);
  now.mockRestore();
});

test('keeps original legacy metadata when a conflicting structured field is present', () => {
  const body = `New Transaction!\nMetadata: ${JSON.stringify(metadata)}`;
  const event = toEvent({ notification: { body }, data: { metadata: '{malformed structured metadata' } });
  expect(event.messages).toEqual(['Invoice 42', 'Paid in ADA']);
  expect(event.originalBody).toBe(body);
  expect(event.data.metadata).toBe('{malformed structured metadata');
});
