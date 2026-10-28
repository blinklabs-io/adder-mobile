# Notification navigation, recovery, and CIP20

**Goal:** Complete the four follow-up items requested by Brian, preserving the approved Expo migration and Adder design.

**Architecture:** Use the installed Firebase notification-open APIs and the existing registration queue. Normalize foreground and opened messages through one event parser. Keep networking bounded and recovery explicit. Parse the current Adder server's `Metadata: {"674":{"msg":[...]}}` notification-body suffix and structured `data.metadata` without requiring a server rollout.

**References:** https://rnfirebase.io/messaging/notifications; https://cips.cardano.org/cips/cip20; `blinklabs-io/adder/output/push/push.go` on main; issues #13 and #23.

## Constraints and decisions

- Work on a follow-up branch from `20e561a`; PR #30 remains unchanged.
- Preserve brown/beige styling, glass navigation, HTTPS endpoint checks, and unlink revocation behavior.
- Brian explicitly deferred live/device/simulator testing. Run code-level tests, type checking, and bundle validation only; provide a repeatable device checklist.
- No real push delivery, cloud builds, signing changes, Firebase project changes, merging, or history rewrites.
- Tapping a notification opens the Feed, closes the scanner, brings the event to the top, and expands its details. Repeated delivery/open callbacks share one feed entry.
- Reject delayed messages after unlink/relink and ignore notifications older than a new link when FCM provides a timestamp. Restore legacy saved endpoint strings as well as new endpoint/time records.
- HTTP registration/deletion waits are capped at 15 seconds with abort signals; failed operations preserve retryable state and never log sensitive URLs/payloads.
- Show manual registration retry and notification settings recovery; recheck permission on returning to the app. Request Android notification permission through the platform API.
- Render valid CIP20 string arrays as selectable plain text, preserve raw metadata for inspection, and tolerate malformed/absent metadata. Encrypted metadata is not presented as plaintext.

## Tasks

- [x] Add failing regressions for foreground/background/cold notification handling, deduplication, stale callbacks, and endpoint scoping; implement notification-open subscriptions and Feed selection.
- [x] Add failing HTTP timeout/abort and registration retry tests; implement bounded requests, recovery controls, scanner retry, and permission refresh/settings handling.
- [x] Add failing CIP20 parser/rendering regressions using the verified legacy and structured payloads; implement readable transaction messages with raw-data disclosure.
- [x] Add Firebase identity validation and a device-test checklist covering QR pairing, background/cold taps, permissions, rotation, offline unlinking, replacement, and metadata. Clearly mark these tests deferred.
- [x] Run the full automated suite, TypeScript, Expo compatibility, platform exports, and independent code review; prepare the follow-up draft PR against the migration branch.

## Review focus

- A cold-start notification must await endpoint restoration and remain ignored after a newer unlink.
- Duplicate foreground/open events must not duplicate rows or prevent a later tap from reopening details.
- Timeouts must release HTTP waits even when fetch ignores cancellation; late responses must not mutate registration state.
- Retry must honor cleanup-pending guards and share the registration queue.
- Malformed metadata, multibyte text, long messages, and malicious-looking plain text must remain safe and readable.

## Progress

- Baseline: 40 tests pass at `20e561a`; both live source checkouts were clean.
- Source discovery: current Adder server already appends canonical CIP20 JSON to transaction notification bodies. No server edit is needed for this compatibility path.
- Native inventory was read-only; no build, simulator, or device processes were started. Live testing was then explicitly deferred by Brian.
- Independent review identified cutoff timing, retired callbacks, token/permission ordering, fallback identities, falsy config acceptance, and conflicting raw metadata. Each issue was reproduced before its fix; the expanded suite passes 87 tests.
- `@expo/plist` 0.8.1 was already locked transitively; it is now a direct development dependency for the Firebase configuration checker. No runtime dependency or Firebase project was added.
- Final verification: 87 tests pass across seven suites; TypeScript, Expo compatibility, actionlint, lockfile/install dry run, and `git diff --check` pass. Both iOS and Android JavaScript/Hermes exports pass. Missing real Firebase files produce expected export configuration warnings; native delivery is not established.
- Final independent review cleared the requested scope. Live device/simulator testing remains deferred. No native builds, simulator launches, real pushes, Firebase project changes, or cloud builds were performed.
