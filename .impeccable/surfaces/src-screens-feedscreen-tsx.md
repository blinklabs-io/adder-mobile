---
version: 1
slug: "src-screens-feedscreen-tsx"
primary_target: "src/screens/FeedScreen.tsx"
related_targets: ["src/screens/SettingsScreen.tsx", "src/screens/ScanScreen.tsx"]
---

## THESIS
A focused mobile inbox for incoming Adder chain events. Pair a phone, identify its endpoint, and read complete records quickly.

## OWN-WORLD
Mode: Operate. The user replaced the flat inbox exploration with three visual references and asked for a clean rounded interface without divider lines. The user explicitly rejected the pastel palette and pinned Adder brown and beige with strong contrast. Beige ground, white cards, espresso text, brown actions, and generous spacing define the current world. The user requested a floating glass bottom navigation bar: native Liquid Glass when supported, frosted blur fallback, soft offset shadow, and a solid brown selected tab. Reduce Transparency uses an opaque surface. Dark appearance uses espresso ground, brown surfaces, and tan actions. Rounded 22-point cards and 18-point controls take precedence over generic radius guidance. The existing app icon and Adder name remain; mascot illustrations are absent from working screens.

## STORY
The header exposes QR scanning. A solid brown endpoint panel anchors the Feed; individual rounded cards prioritize titles, timestamps, event prose, and disclosure. Pairing uses the original explanation and primary scan action. Settings separates endpoint management and device state through soft grouped surfaces and spacing. Camera aiming keeps its functional corner guides, dismissal, and recovery.

## FIRST VIEWPORT
Adder text heading and a circular 48-point scan control; linked endpoint in a rounded brown panel with cream foreground; session count beside Events; inset white event cards without rules. The small amber Latest badge identifies the first record in this session. Tapping a record reveals complete selectable payload values in the same card. Native text scales and records scroll. The measured navigation height plus safe-area inset and 24-point gap reserve scrolling clearance under the floating bar.

## FORM
Code-led exploration authorized by "sure just try out difeernet uis". Direction seed 24ccb7b2 ran degraded without challengers. The user's supplied images pin rounded, borderless mobile surfaces. Their subsequent correction pins brown/beige colors drawn from the existing Adder icon and overrides the rejected pastel palette. The preview under docs/ui-options now presents the current rounded implementation, including light/dark and recovery states. No approved pixel comp exists; the user's images are style references. Native controls, safe areas, font scaling, and Reduce Motion remain intact.

## FINISH
Verify real source with TypeScript and Android/iOS JavaScript exports. Native iPhone 17 Pro captures use isolated sample fixtures and include light/dark Feed, Settings, pairing, empty Feed, expanded records, camera recovery, linking, and large text. Native Android, physical QR pairing, and Firebase delivery remain unverified. Preserve existing Flutter/native working-tree edits.
