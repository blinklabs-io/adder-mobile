# Screenshots

These files archive the October 5 design. The current October 6 rounded UI captures and preview are in [../ui-options/](../ui-options/README.md).

Captured on 2026-10-05 from the observation-log redesign committed alongside this index, running in Expo Go 57.0.9 on an iPhone 17 Pro simulator (iOS 26.3, 1206 × 2622).

These are native React Native UI captures with local fixtures. The linked endpoint (`adder.example.com`), events, notification permission, and push token are sample data. Scan states use a simulated camera permission and initial scan status; the simulator has no live camera feed. These captures establish screen appearance only. Firebase registration, push delivery, and physical-camera QR scanning require a configured native development build and device verification. Android native appearance remains unverified.

A separate temporary checkout replaced Firebase calls with local fixtures and selected each initial screen state. The production layouts, tokens, native symbols, and screen text were used unchanged. Capture-only changes are excluded from the PR.

The redesign uses cool lavender surfaces, violet controls, amber timeline markers, native system typography and symbols, and the original snake artwork. Events disclose their full payload; the linked instance occupies a compact panel. The scanner now owns its modal safe area, supports scrolling at large text sizes, and honors Reduce Motion.

| File | State |
|---|---|
| `feed-unlinked.png` | Feed, before linking |
| `feed-linked.png` | Feed, sample linked endpoint and three sample events |
| `feed-empty.png` | Feed, sample linked endpoint with no events |
| `event-expanded.png` | Sample event with complete payload disclosed |
| `scan.png` | Scan modal, idle viewfinder |
| `scan-error.png` | Scan modal, invalid-code error |
| `scan-permission.png` | Camera permission explanation |
| `scan-linking.png` | Linking progress |
| `settings.png` | Settings, sample linked endpoint and token |
| `feed-linked-dark.png` | Feed with sample events, dark appearance |
| `settings-dark.png` | Settings, dark appearance |

Validation: TypeScript passes; production JavaScript/Hermes exports pass for iOS and Android from an isolated checkout with the legacy Flutter native directories moved aside. Missing Firebase configuration still prevents a fully configured native application build. Native UI checks covered event expansion, tab navigation, token copy, scanner open/close, error retry, iPhone SE layout, and enlarged iOS text. Text/action color pairs checked across both themes exceed 4.5:1 contrast.

Capture the running simulator with `npm run screenshot -- <name>`. The PR description uses full image URLs pinned to the screenshot commit so GitHub can render them from the PR page.
