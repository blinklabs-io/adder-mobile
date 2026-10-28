# Notification payload compatibility

The app handles Firebase foreground messages, background notification taps, and the initial notification that opens a closed app. It deduplicates by FCM message ID and opens tapped events in the Feed. Events are kept for the current session; the tapped notification provides its own content after a cold start.

## Transaction messages

[CIP20](https://cips.cardano.org/cips/cip20) stores text under metadata label `674`, key `msg`, as an array of UTF-8 strings of at most 64 bytes each. The app displays valid lines as selectable plain text, preserving order and line breaks. Arrays containing invalid entries, malformed JSON, oversized lines, and encrypted metadata are excluded from the readable transaction-message field. The original event content remains available.

Preferred structured FCM data uses JSON encoded as a string, because FCM data values must be strings:

```json
{
  "notification": { "title": "Adder", "body": "New Transaction!" },
  "data": {
    "type": "transaction",
    "metadata": "{\"674\":{\"msg\":[\"Invoice 42\",\"Paid in ADA\"]}}"
  }
}
```

The current [Adder push output](https://github.com/blinklabs-io/adder/blob/main/output/push/push.go) already appends metadata to the notification body:

```text
New Transaction!
Hash: example-transaction-hash
Metadata: {"674":{"msg":["Invoice 42","Paid in ADA"]}}
```

This legacy format is supported without a server deployment. Valid JSON is separated from the summary, shown as readable transaction text, and retained in the expandable metadata data field. Unparseable suffixes remain unchanged in the body.

All examples are synthetic. Notification bodies, metadata, and complete payloads must stay out of production device logs.
