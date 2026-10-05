---
name: Adder
description: A native observation log for incoming chain events.
colors:
  paper-light: "#F3F2FA"
  panel-light: "#E9E5F7"
  card-light: "#FFFFFF"
  rule-light: "#DCD8EB"
  ink-light: "#252137"
  ink-secondary-light: "#686178"
  accent-light: "#6442C5"
  accent-soft-light: "#E7DFFB"
  on-accent-light: "#FFFFFF"
  signal-light: "#826000"
  signal-soft-light: "#F5E8BE"
  alarm-light: "#B6314B"
  alarm-soft-light: "#FCE6EA"
  paper-dark: "#191623"
  panel-dark: "#252033"
  card-dark: "#302A40"
  rule-dark: "#463D57"
  ink-dark: "#F1EDF9"
  ink-secondary-dark: "#B7AEC8"
  accent-dark: "#C4ACFF"
  accent-soft-dark: "#3D2E59"
  on-accent-dark: "#241639"
  signal-dark: "#E8C66A"
  signal-soft-dark: "#44391E"
  alarm-dark: "#FF9EB0"
  alarm-soft-dark: "#4B2836"
  camera: "#141220"
  camera-ink: "#FFFFFF"
  camera-muted: "#D7D1EA"
typography:
  headline:
    fontFamily: system-ui
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  title:
    fontFamily: system-ui
    fontSize: "18px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  body:
    fontFamily: system-ui
    fontSize: "17px"
    lineHeight: "25px"
  label:
    fontFamily: system-ui
    fontSize: "13px"
    lineHeight: "19px"
  metadata:
    fontFamily: system-ui
    fontSize: "12px"
    lineHeight: "17px"
  button:
    fontFamily: system-ui
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  mono-ios:
    fontFamily: Menlo
    fontSize: "13px"
  mono-android:
    fontFamily: monospace
    fontSize: "13px"
rounded:
  card: "16px"
  control: "12px"
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
    backgroundColor: "{colors.accent-soft-light}"
    textColor: "{colors.accent-light}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-secondary-dark:
    backgroundColor: "{colors.accent-soft-dark}"
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
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "18px"
  event-record:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "16px"
  settings-group:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "18px"
  tab-bar:
    backgroundColor: "{colors.card-light}"
    typography: "{typography.metadata}"
  scanner-status:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "22px"
---

# Design System: Adder

## Overview

**Creative North Star: "The Observation Log"**

Adder uses cool lavender surfaces, violet actions, and amber event markers to make incoming chain events easy to read on a phone. The original snake supplies identity at the feed header and Settings footer. Chronology, compact native typography, and inspectable records provide the visual character.

The user requested an identity distinct from Ordo. Warm paper, cream and charcoal compositions, the stacked-line mark, oversized counts, and editorial presentation are confirmed anti-references. The implementation follows a code-led direction; a visual comp was never approved. Restrained mascot placement is an implementation assumption because the optional prominence question received no answer.

This document records `src/theme.ts`, `src/components/ui.tsx`, `src/components/TabBar.tsx`, `src/screens/*.tsx`, and `App.tsx`. Frontmatter `px` values serialize React Native logical units for portable tooling; native text still scales with system settings. Light/dark suffixes map to the matching palette in `src/theme.ts`; camera tokens are shared by both appearances. Local measurements appear with their owning component below.

**Key Characteristics:**

- Cool tonal surfaces and restrained violet actions.
- Amber chronology markers with a visible Latest label.
- Original snake artwork at brand touchpoints.
- Native text, platform symbols, safe areas, and scalable content.
- Complete event data available through inline disclosure.

Verification evidence covers iOS simulator fixture UI. Android JavaScript/Hermes export passed; Android native appearance still requires device or emulator verification. Firebase delivery and physical QR pairing still require end-to-end testing. Fixture captures establish appearance and interaction only.

## Colors

The palette moves from pale lavender in light appearance to deep purple surfaces in dark appearance; violet, amber, and rose retain separate jobs.

### Primary

- **Action violet** (`accent-*`) marks primary buttons, active destinations, link/scan symbols, and event disclosure affordances.
- **Violet wash** (`accent-soft-*`) backs secondary controls and the selected Android tab symbol.
- **Action contrast** (`on-accent-*`) supplies foreground contrast inside filled primary buttons.

### Secondary

- **Received amber** (`signal-*`) identifies the newest timeline node and its Latest label. `signal-soft-*` exists in the palette and currently has no rendered consumer.

### Tertiary

- **Error rose** (`alarm-*`) identifies unlink text and scanner failure framing. The shared Button component also provides an alarm variant using `alarm-soft-*`; current screens use primary and secondary Button variants.

### Neutral

- **Lavender ground** (`paper-*`) fills the screen; **instance panel** (`panel-*`) identifies the linked endpoint and pairing illustration.
- **Record surface** (`card-*`) groups event data, settings, scanner status, and bottom navigation.
- **Fine rule** (`rule-*`) separates settings rows, traces chronology, and defines the tab-bar edge.
- **Primary ink** (`ink-*`) carries headings and data; **secondary ink** (`ink-secondary-*`) carries supporting prose and metadata.
- **Camera ground**, **camera ink**, and **camera muted** keep the scanner header and framing instruction legible over its dark camera treatment.

**The Action and Arrival Rule.** Use violet for actions and amber for the latest received event; retain the accompanying text label.

## Typography

**Headline and body font:** native system text. The React Native Text components omit `fontFamily`; the portable frontmatter names this `system-ui`. This is the native mobile type system, with no added display font.

**Data font:** Menlo on iOS and monospace on Android. Endpoint and payload values use selectable native Text where implemented.

The `Display` component supplies compact bold headings with slightly tightened spacing; its default is the `headline` token. It also accepts medium weight (600). `Body` computes line height as `Math.round(size * 1.45)`. `Mono` inherits native line height and secondary ink unless its caller overrides the color.

### Hierarchy

- **Headlines:** local sizes are 30 for the unlinked prompt, 28 for Settings, 25 for the Adder name, 23 for empty states, 22 for scanner status, and 20 for the scanner heading.
- **Section titles:** 19; **event and pairing titles:** the `title` token.
- **Body:** the `body` token for event prose, pairing explanations, permission messages, scanner explanations, and settings rows.
- **Labels:** `label` for endpoint captions, session count, scanner instruction, and event disclosure; `metadata` for relative time, Latest, tab names, payload keys, and version. Latest, active tabs, and disclosure text use weight 600.
- **Data:** the platform mono token; the linked host uses a local size of 14. The Settings footer name also uses size 14 with weight 600.

**The Native Reading Rule.** Preserve native font scaling, allow prose and data to wrap, and keep session counts at metadata scale.

## Layout

The app uses one fluid column. Screen gutters use `spacing.l`; scrolling content ends with `spacing.xl`. Feed uses FlatList and Settings uses ScrollView. The root respects the top safe area; bottom navigation adds `max(bottomInset, 8)` below its content.

The shared spacing scale supplies the recurring rhythm. Local values remain component-specific: the feed brand row has gap 10 and vertical padding 12; section headers use top margin 28; linked and settings groups use inset 18; event records use inset 16; scanner status uses inset 22; the unlinked illustration panel uses inset 24. These values are observed implementation details rather than additional shared spacing tokens.

Headers and settings rows can wrap. Buttons allow their labels to shrink and wrap. The unlinked headline has a local maximum width of 300. Interactive controls use minimum touch targets: 52 high for shared buttons, 56 high for tabs, and 48 for copy, unlink, and scanner close controls.

The scanner Modal owns a SafeAreaProvider. Its header stays within the safe area and its finder/status content scrolls at larger text sizes. Finder width and height are `min(248, windowWidth - 96)`; the finder region reserves at least `finder + 80` height. There are no width breakpoints or separate tablet composition in the current source.

## Elevation & Depth

Surfaces use tonal separation, one-unit rules, and containment. The source defines no shadows or elevation. Cards sit within the cool screen ground; the linked panel has its own tint. The scanner is the full-screen task layer, presented with a native slide when motion is allowed.

**The Tonal Depth Rule.** Distinguish surfaces through palette roles and fine rules; preserve the flat resting state.

Event disclosure fades from opacity 0.4 to 1 over 180 ms. Modal presentation uses `slide` or `none`. Both read the shared `useReducedMotion` hook, which begins with reduced motion enabled while the system setting loads, then subscribes to setting changes. Shared buttons use light impact haptics, tab changes use selection haptics, and scanner outcomes use success/error notification haptics.

## Shapes

Shared surfaces use `rounded.card`; shared controls use `rounded.control`. Both are modest curves sized for native controls. Event and phone-setting groups clip their contents. Full-width separators remain fine, straight lines.

Local geometry includes the timeline's 11-unit circular node with radius 6 and stroke 2; the Android selected-tab capsule at 64 by 30 with radius 15; the scanner close circle at 48 by 48 with radius 24; and 32-by-32 finder corners with stroke 3 and radius 12. The unlinked phone illustration is 64 by 76, stroke 2, radius 12, with a small 18-by-3 home indicator.

## Components

### Buttons

Clear, substantial controls with readable labels. Primary, secondary, and alarm color assignments appear in frontmatter. All shared Button variants have a minimum height of 52, horizontal content gap 10, optional 20-unit symbol, and native loading indicator. Pressed opacity is 0.75; an explicitly disabled button uses 0.45. Loading also disables input and exposes the busy accessibility state. The alarm variant is implemented but currently unused by screens.

### Linked instance and settings groups

The linked endpoint occupies a panel-tinted container with a 26-unit link symbol and selectable host. Settings groups use the record surface, 18-unit insets, and a one-unit divider inset by 18. The endpoint is shown in full; the push token is visually shortened and Copy copies its full value. Copy feedback changes to Copied for 1500 ms. Unlink uses rose text in its own minimum-height row.

### Navigation and symbols

Feed and Settings have equal-width destinations. A card-colored bar, top rule, 22-unit symbol, and 12-unit label provide the structure. Active text and symbol use violet; inactive content uses secondary ink. iOS selection uses color and weight on a transparent symbol container. Android selection adds the violet-wash capsule. Each destination exposes native tab semantics and selected state.

`expo-symbols` supplies SF Symbols on iOS and Material Symbols on Android. The mappings are `list.bullet`/`list`, `gearshape`/`settings`, `qrcode.viewfinder`/`qr_code_scanner`, `xmark`/`close`, `chevron.right`/`chevron_right`, and `link`/`link`. Decorative symbols are hidden from accessibility navigation; their controls carry labels.

### Event timeline

Each record occupies a card beside a narrow chronology rail. The rail gutter is 24 with right margin 10. A one-unit connector runs between nodes and ends before the final record. The newest node is filled amber; earlier nodes use the screen background with secondary-ink strokes. Relative time and Latest appear above the title and body.

Records with payload entries act as disclosure controls. View event data and Hide event data expose state visibly; accessibility receives expanded state and a hint. Disclosure reveals every key/value pair and selectable mono values. The chevron changes orientation. Empty payloads have no disclosure control. Event presses use opacity 0.72. Expanded content keeps 16-unit side/bottom padding and a 12-unit gap between fields.

### Scanner

The camera treatment uses a local `rgba(20,18,32,0.28)` scrim over the shared camera ground. Close uses local normal `#30283E` and pressed `#514564` fills. Finder corners use the dark-palette violet (`#C4ACFF`) while idle and error rose (`#FF9EB0`) after failure, in both appearance modes. These values support the camera context and remain local to the scanner.

The status surface follows the active light/dark palette, with a 22-unit title and standard body. Linking shows a spinner; error shows Try again. Permission states explain camera use and offer Allow camera or Open Settings plus a dismissal action. Permission content scrolls, and the initial permission-loading state also offers Cancel.

### Brand and empty states

Use `assets/icon/adder-icon.png` as supplied. It renders at 34 in the Feed header and 30 beside the Settings version; the Brand component default is 36. Empty states use a 48-unit violet-wash symbol container, compact heading, body, and optional actions. The current source has no text-entry fields or filter chips.

The sidecar's HTML/CSS samples translate these native components for the Impeccable panel. Keyboard focus outlines in those samples are panel affordances; they establish no additional native-app behavior. Its eight-step OKLCH color ramps are synthesized preview aids; the source palette values in frontmatter remain normative.

## Do's and Don'ts

### Do:

- **Do** use the light and dark palette roles together when adding a surface.
- **Do** keep violet actions and amber latest-event markers semantically distinct.
- **Do** use the original snake at brand touchpoints and platform symbols for controls.
- **Do** preserve native text scaling, wrapping, safe areas, and the shared Reduce Motion behavior.
- **Do** expose complete event payloads through readable, selectable values.
- **Do** keep counts and timestamps subordinate to event content.

### Don't:

- **Don't** reintroduce Ordo's cream/charcoal composition, stacked-line mark, or oversized metric presentation.
- **Don't** use an Android selection capsule on the iOS tab bar.
- **Don't** label a linked endpoint healthy or live without a measured health signal.
- **Don't** treat simulator fixtures or JavaScript export as proof of physical pairing, push delivery, or Android native appearance.
