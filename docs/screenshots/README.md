# Screenshots

Captured with `npm run screenshot -- <name>` from a booted simulator. Each file is referenced from the PR description.

| File | State |
|---|---|
| `feed-unlinked.png` | Feed, first launch, before scanning |
| `feed-linked.png` | Feed, linked, with events |
| `feed-empty.png` | Feed, linked, no events yet |
| `scan.png` | Scan modal, viewfinder |
| `scan-error.png` | Scan modal, invalid code |
| `settings.png` | Settings, linked |
| `feed-linked-dark.png` | Feed, linked, dark mode |

Dark mode on the simulator: `xcrun simctl ui booted appearance dark`.
Seed a linked state without a server: scan any QR containing `{"apiEndpoint":"https://example.com"}` against a local `python3 -m http.server`-style endpoint that returns 201, or temporarily set `adder.endpoint` in AsyncStorage.
