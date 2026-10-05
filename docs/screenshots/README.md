# Screenshots

Captured on 2026-10-05 from the PR UI at `316f4ee929d54e2154c6299010ba859217a0d607`, running in Expo Go 57.0.9 on an iPhone 17 Pro simulator (iOS 26.3, 1206 × 2622).

These are native React Native UI captures with local fixtures. The linked endpoint (`adder.example.com`), events, notification permission, and push token are sample data. The scan states use a simulated camera permission and initial scan status; the simulator has no live camera feed. These captures establish screen appearance only. Firebase registration, push delivery, and physical-camera QR scanning still require a configured native development build and device verification.

The temporary capture checkout loaded the existing Space Grotesk fonts at runtime, replaced Firebase calls with local fixtures, and selected the initial screen state. The app's layout, colors, components, and screen text were preserved. Capture-only changes are excluded from the PR.

The scan captures retain the current modal layout, including the header and bottom text overlapping the simulator's system inset areas. This remains visible for review.

| File | State |
|---|---|
| `feed-unlinked.png` | Feed, before linking |
| `feed-linked.png` | Feed, sample linked endpoint and three sample events |
| `feed-empty.png` | Feed, sample linked endpoint with no events |
| `scan.png` | Scan modal, idle viewfinder |
| `scan-error.png` | Scan modal, invalid-code error |
| `settings.png` | Settings, sample linked endpoint and token |
| `feed-linked-dark.png` | Feed with sample events, dark appearance |

Capture the running simulator with `npm run screenshot -- <name>`. Switch its appearance with `xcrun simctl ui booted appearance light` or `dark`.

The PR description uses full image URLs pinned to the screenshot commit so GitHub can render them from the PR page.
