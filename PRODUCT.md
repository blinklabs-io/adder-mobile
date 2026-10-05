# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

People using an Adder instance to receive chain-event notifications on their phone. This audience is inferred from the existing README and screens.

## Product Purpose

Pair a phone with an Adder instance by scanning its endpoint QR code, then read incoming events and manage the linked endpoint.

## Operating Context

Expo / React Native on iOS and Android. Feed and Settings are the two top-level destinations. Scanning is a dismissible camera task.

## Capabilities and Constraints

- The QR contains `apiEndpoint`; linking sends an FCM token and expects HTTP 201.
- The endpoint persists; the feed currently holds events for the session.
- Firebase messaging requires a configured native development build.
- Simulator screenshots use explicitly labeled local fixtures. They establish UI appearance, not push-delivery or physical-camera verification.
- This redesign preserves those functions and existing product content; backend and release migration are outside its scope.

## Brand Commitments

The name is Adder. The existing snake artwork is in `assets/icon/adder-icon.png`. The user explicitly requested a distinct identity from Ordo: the previous cream/charcoal palette, stacked-line mark, oversized counts, and editorial presentation are anti-references. The implementation uses the mascot sparingly at brand touchpoints. The optional prominence question received no answer.

## Evidence on Hand

`README.md`, `src/services/`, `src/store.tsx`, `src/screens/`, and the simulator captures under `docs/screenshots/`. There is no verified live connection-health measurement in the current store.

## Product Principles

- Make pairing and event reading easy on a phone.
- Show states supported by the available data.
- Respect native navigation, touch targets, safe areas, large text, and light/dark appearance.
- Give Adder a recognizable identity separate from the user's other apps.
