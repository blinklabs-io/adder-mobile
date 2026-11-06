---
name: "Adder"
description: "A clean, rounded mobile inbox for incoming chain events."
colors:
  paper-light: "#F4EFE7"
  panel-light: "#E7DCCB"
  card-light: "#FFFFFF"
  rule-light: "#D6C8B7"
  ink-light: "#2F241C"
  ink-secondary-light: "#6D5B4C"
  accent-light: "#713F25"
  accent-soft-light: "#EAD8C0"
  on-accent-light: "#FFF9EE"
  signal-light: "#755026"
  signal-soft-light: "#EFE1CD"
  alarm-light: "#A13C2F"
  alarm-soft-light: "#F4E3DD"
  camera: "#19130F"
  camera-ink: "#FFF9EE"
  camera-muted: "#DED1C2"
  paper-dark: "#1C1612"
  panel-dark: "#382B21"
  card-dark: "#2B221B"
  rule-dark: "#514032"
  ink-dark: "#F5EDE1"
  ink-secondary-dark: "#C7B5A2"
  accent-dark: "#D0A16D"
  accent-soft-dark: "#453324"
  on-accent-dark: "#271A10"
  signal-dark: "#E1BC84"
  signal-soft-dark: "#453526"
  alarm-dark: "#E4A091"
  alarm-soft-dark: "#492820"
  camera-overlay: "rgba(25,19,15,0.28)"
  camera-close: "#35271E"
  camera-close-pressed: "#544032"
  nav-glass-light: "rgba(244,239,231,0.3)"
  nav-glass-dark: "rgba(43,34,27,0.3)"
  nav-blur-overlay-light: "rgba(244,239,231,0.72)"
  nav-blur-overlay-dark: "rgba(43,34,27,0.72)"
typography:
  headline:
    fontFamily: "system-ui"
    fontSize: "28px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  display:
    fontFamily: "system-ui"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  section:
    fontFamily: "system-ui"
    fontSize: "20px"
    fontWeight: 600
    letterSpacing: "-0.3px"
  title:
    fontFamily: "system-ui"
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.3px"
  body:
    fontFamily: "system-ui"
    fontSize: "17px"
    lineHeight: "25px"
  label:
    fontFamily: "system-ui"
    fontSize: "13px"
    lineHeight: "19px"
  metadata:
    fontFamily: "system-ui"
    fontSize: "12px"
    lineHeight: "17px"
  button:
    fontFamily: "system-ui"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  mono-ios:
    fontFamily: "Menlo"
    fontSize: "13px"
  mono-android:
    fontFamily: "monospace"
    fontSize: "13px"
rounded:
  card: "22px"
  control: "18px"
  tab-capsule: "30px"
  badge: "12px"
  icon-control: "24px"
  navigation: "36px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.on-accent-light}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-primary-dark:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.accent-light}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-secondary-dark:
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.accent-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-alarm:
    backgroundColor: "{colors.alarm-soft-light}"
    textColor: "{colors.alarm-light}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-alarm-dark:
    backgroundColor: "{colors.alarm-soft-dark}"
    textColor: "{colors.alarm-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  linked-instance:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.on-accent-light}"
    rounded: "{rounded.card}"
    padding: "20px"
  linked-instance-dark:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.on-accent-dark}"
    rounded: "{rounded.card}"
    padding: "20px"
  event-record:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "18px 20px"
  event-record-dark:
    backgroundColor: "{colors.card-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.card}"
    padding: "18px 20px"
  settings-group:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "18px"
  settings-group-dark:
    backgroundColor: "{colors.card-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.card}"
    padding: "18px"
  scanner-status:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "22px"
  scanner-status-dark:
    backgroundColor: "{colors.card-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.card}"
    padding: "22px"
  latest-badge:
    backgroundColor: "{colors.signal-soft-light}"
    textColor: "{colors.signal-light}"
    typography: "{typography.metadata}"
    rounded: "{rounded.badge}"
    padding: "3px 10px"
  tab-bar:
    backgroundColor: "{colors.nav-glass-light}"
    typography: "{typography.metadata}"
    rounded: "{rounded.navigation}"
    padding: "6px"
    width: "100%"
  tab-capsule:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.on-accent-light}"
    typography: "{typography.metadata}"
    rounded: "{rounded.tab-capsule}"
    padding: "7px 12px"
  scan-control:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.accent-light}"
    rounded: "{rounded.icon-control}"
    size: "48px"
  tab-bar-dark:
    backgroundColor: "{colors.nav-glass-dark}"
    typography: "{typography.metadata}"
    rounded: "{rounded.navigation}"
    padding: "6px"
    width: "100%"
  tab-capsule-dark:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.metadata}"
    rounded: "{rounded.tab-capsule}"
    padding: "7px 12px"
---

# Design System: Adder

## Overview

**Creative North Star: "The Rounded Inbox"**

Adder uses cream ground, white cards, deep brown text, and contrasting brown actions to make pairing and incoming events easy to read on a phone. The brown, tan, and cream palette comes from the existing Adder icon. Rounded surfaces and generous spacing establish a calm, mature mobile interface. Floating glass navigation adds the depth explicitly requested by the user. The name and app icon preserve Adder identity; working screens use text and platform symbols.

The user retained the clean, rounded direction, explicitly rejected divider-heavy presentation and pastels, and selected brown and beige with stronger contrast for an enterprise, App Store quality interface. This document records the implemented system in `src/theme.ts`, shared components, and the three screens. Frontmatter `px` values serialize React Native logical units; native text scales with system settings. Light/dark suffixes map to theme appearances and camera tokens are shared.

**Key Characteristics:**

- Cream ground, white cards, and contrasting brown actions.
- Rounded cards and controls with spacing between groups.
- Native typography, platform symbols, safe areas, and scalable content.
- Inline disclosure for complete selectable event data.
- A labeled amber Latest badge and floating glass navigation with filled selected tabs on both platforms.

## Colors

Light appearance uses cream ground, white cards, and beige controls; dark appearance uses deep brown ground and warmer brown surfaces. Brown, amber, and brick red carry distinct functions.

### Primary

- **Adder brown / warm tan** (`accent-*`) identifies actions, selected tabs, and link/scan symbols, and fills the linked endpoint panel.
- **Tan wash** (`accent-soft-*`) fills functional icon backplates.
- **Action contrast** (`on-accent-*`) supplies foreground contrast on filled primary buttons and the linked endpoint panel.

### Secondary

- **Arrival amber** (`signal-*`) and **amber wash** (`signal-soft-*`) identify the first session record with a Latest badge.

### Tertiary

- **Error brick / warm coral** (`alarm-*`) identifies unlinking and scanner errors. The shared alarm button uses `alarm-soft-*`; current screens use primary and secondary buttons.

### Neutral

- **Cream ground / deep brown ground** (`paper-*`) fills screens. Warm translucent navigation tints and blur overlays (`nav-glass-*`, `nav-blur-overlay-*`) keep the floating bar within the same palette.
- **Beige / warm brown panel** (`panel-*`) fills secondary controls; **white / brown card** (`card-*`) groups records and settings.
- **Primary ink** (`ink-*`) carries headings and data; **secondary ink** (`ink-secondary-*`) carries supporting prose and metadata.
- **Rule** (`rule-*`) remains a theme token with no current screen consumer. It does not authorize adding dividers.
- **Camera ground, ink, muted, overlay, and close-control tones** keep scanner controls readable over the preview. The scanner error corners use `alarm-dark` in both appearances.

## Typography

Native system text supplies headings and body copy. React Native Text omits `fontFamily`; portable tokens name the family `system-ui`. Technical values use Menlo on iOS and monospace on Android.

The header role is used by Adder and Settings. The display role is the shared Display default and unlinked prompt. Section headings use the section role; event titles use the title role. The scanner heading/status uses Display at size 20 and weight 700; empty-state titles use size 22. Body computes line height as `Math.round(size * 1.45)`. Supporting pairing copy uses Body at size 15; the linked host uses Mono at size 14. Label text includes disclosure and endpoint captions; metadata includes timestamps, counts, Latest, tab names, payload keys, and version. Latest and disclosure use weight 600; selected tab labels use 600 and inactive labels 400. Mono inherits native line height.

**The Native Reading Rule.** Preserve native text scaling, allow prose and data to wrap, and keep counts and timestamps subordinate to event content.

## Layout

One fluid column uses `spacing.l` screen gutters. Feed uses FlatList; Settings uses ScrollView; scrolling content reserves measured navigation height plus `max(bottom safe inset, 12)` plus 24 as bottom clearance. Root and scanner respect safe areas. Section headings have a local top margin of 28 and bottom margin of `spacing.m`; event cards are separated by `spacing.m`. Settings rows use local padding 18 and wrap state labels. Unlinked content begins with a local top inset of 40. Endpoint and payload values can wrap without truncation; the Settings token display is intentionally shortened and Copy transfers the full token.

Buttons have minimum height 52; scan and dismiss controls are 48 square; tabs have minimum height 60. Settings scan rows have minimum height 56; unlink and Copy targets have minimum height/width 48 where implemented. Floating navigation sits at `max(bottom safe inset, 12)`, uses 20-point side gutters, and caps its width at 360. Its measured height updates Feed and Settings bottom clearance so large text and final rows can scroll above the bar. The scanner finder is `min(248, viewport width - 96)`, with a scrollable status area for large text.

## Elevation & Depth

Cards remain flat at rest. Surface tone, shape, and spacing establish content groups. The floating navigation alone uses glass and a warm brown shadow: color `on-accent-dark`, offset (0, 6), opacity 0.16 light / 0.3 dark, radius 18, and Android elevation 8. Press feedback uses opacity, with light haptics on shared buttons and selection haptics on changed tabs. Scanner dismissal uses a brighter background when pressed. Payload disclosure fades from opacity 0.4 to 1 over 180ms when Reduce Motion is off.

**The Space Between Rule.** Separate cards and settings groups with spacing and tonal surfaces. Keep screen dividers, timeline rails, and decorative outlines absent; camera corner guides remain functional.

## Shapes

Cards and grouped surfaces use `rounded.card`; filled buttons use `rounded.control`. These values reflect the user's rounded direction and take precedence over generic native radius defaults. Latest uses `rounded.badge`. The floating navigation uses `rounded.navigation`; selected tabs fill their flexible segment with `rounded.tab-capsule`; round scan and dismiss controls use `rounded.icon-control`. Empty/setup icon backplates are circular (56/64 square). Camera framing uses functional 32-square corners, stroke width 3, and corner radius 12.

**The Shared Shape Rule.** Use the card and control radii for their respective surfaces and the selected tab capsule on both iOS and Android.

## Components

- **Buttons:** primary uses accent/on-accent; secondary uses panel/accent; the available alarm variant uses alarm-soft/alarm. Shared padding and shapes follow frontmatter. Pressed opacity is 0.75 and disabled opacity 0.45; loading displays a spinner and prevents action.
- **Linked endpoint:** filled accent panel with on-accent link symbol, caption, and selectable mono host. It describes pairing, with no connection-health claim.
- **Event record:** soft card, medium title and timestamp on a wrapping row, labeled Latest badge for the first record, optional body, and accent disclosure. Expanded values remain inside the card. Records without payload entries have no disclosure action.
- **Settings group:** soft card with spaced rows, endpoint data, scan action, unlink text, permission state, and token Copy. Groups have no inset dividers.
- **Navigation:** Feed and Settings sit in a floating glass pill with inner padding/gap 6. Each tab has minimum height 60, padding 7 vertical / 12 horizontal, icon size 22, and native-scaling Body label size 12. Selection fills the whole segment with accent/on-accent and weight 600; inactive symbols/labels use ink and weight 400. Pressed opacity is 0.7; changing tabs gives selection haptics. Supported iOS APIs render regular GlassView with warm tint. Otherwise BlurView intensity 75 samples the screen through BlurTargetView, using `dimezisBlurViewSdk31Plus` on Android and a warm 0.72 overlay. Reduce Transparency switches the backing to opaque card. The `expo-blur` and `expo-glass-effect` dependencies require a rebuilt native app.
- **Scanner status:** theme-aware rounded card for aiming, linking, and recovery; the dark camera preview retains corner guides and a round close control. Permission screens use the shared empty-state layout and buttons.

The sidecar HTML/CSS tiles are visual samples of native components. Browser focus/hover treatments serve the sample panel; they do not establish a web implementation or substitute for native behavior. The app has no text-input primitive.

## Do's and Don'ts

### Do:

- Do pair light and dark palette roles when adding a surface.
- Do separate groups with spacing and soft surface fills.
- Do use Adder brown/tan for actions, amber for the labeled Latest badge, and brick/coral for errors or unlinking.
- Do preserve native text scaling, wrapping, safe areas, touch targets, and Reduce Motion.
- Do expose complete event payloads as readable, selectable values.
- Do preserve the Adder name and existing app icon.

### Don't:

- Don't add divider lines, timeline rails, decorative outlines, or card shadows; reserve glass and shadow for the floating navigation.
- Don't place mascot illustrations in Feed, Settings, or scanner screens.
- Don't remove the selected tab capsule from either platform.
- Don't label a linked endpoint healthy or live without a measured health signal.
- Don't treat fixture captures or JavaScript exports as proof of Android native appearance, physical QR pairing, or push delivery.
