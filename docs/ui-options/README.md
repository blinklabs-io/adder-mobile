# Rounded UI preview

The current implementation follows Brian's October 6 references: beige ground, white rounded cards, dark brown actions, pill controls, and spacing in place of divider lines. The palette comes from the existing Adder icon. Bottom navigation floats over content in a rounded glass surface, with solid selected tabs, safe-area spacing, and measured scroll clearance. The user's brown/beige correction replaces the rejected pastel prototype.

Open http://127.0.0.1:8094/ while the local preview server runs. To restart:

```sh
python3 -m http.server 8094 --bind 127.0.0.1 --directory docs/ui-options
```

`index.html` displays the native screenshots; Light/Dark switches their appearance and tapping a screen opens a larger view. Additional states include expanded records, empty Feed, scanner, scan errors, camera permission, linking, large text, frosted fallback, and Reduce Transparency.

Captures in `rounded/` were taken on October 6, 2026 in Expo Go 57.0.9, iPhone 17 Pro simulator, iOS 26.3, at 1206 × 2622. They use the real screen components in a temporary isolated harness, with sample endpoint/events/token and mocked Firebase and camera state. Camera previews are dark because the simulator has no live camera. Capture fixtures are excluded from app source.

Validation: TypeScript and real-source iOS/Android JavaScript/Hermes exports pass. Native checks cover text/action contrast of at least 4.5:1, light/dark native captures, and enlarged text. The fresh visual review returned `ship` for all 16 supplied iOS captures, with no material visual fixes. Final tap and bottom-scroll interaction remain unverified. Android native appearance, Firebase delivery, and physical QR pairing still require a configured native build and device verification. Interactive rechecking was blocked by the computer-control service's native pipe startup failure; earlier checks exercised event disclosure, tab navigation, token copy, and scanner dismissal before the final rounded styling.

Research sources: [Linear Mobile](https://linear.app/mobile), [Slack's mobile navigation redesign](https://slack.design/articles/re-designing-slack-on-mobile/), and [SAP Fiori object cells](https://help.sap.com/doc/f53c64b93e5140918d676b927a3cd65b/Cloud/en-US/docs-en/guides/features/fiori-ui/android/object-cell.html). Brian's supplied rounded examples determine the current visual direction.

Glass uses [Expo GlassEffect](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/) on supported iOS builds and [Expo BlurView](https://docs.expo.dev/versions/v57.0.0/sdk/blur-view/) elsewhere. Android targets the content view and uses the SDK 31+ blur method; older Android versions use the translucent fallback. Reduce Transparency uses an opaque card. Added native modules require rebuilding a native development/release app.
