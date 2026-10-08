# adder-mobile

Mobile app for receiving adder push notifications. Expo (React Native) + Firebase Cloud Messaging.

## Setup

```sh
npm ci
# drop Firebase config at repo root (gitignored):
#   google-services.json  (Android)  GoogleService-Info.plist (iOS)
npx expo prebuild --clean   # generates ios/ and android/
npx expo run:ios            # or run:android
```

Firebase Messaging needs native code, so the app runs in a dev build, not Expo Go.
Cloud builds: `eas build --profile development|preview|production`.

Use Node 22.13 or newer. The project `.npmrc` and lockfile use the public HTTPS npm registry.

### Expo native projects and CI

Native projects are generated from `app.json` / `app.config.js` and are excluded from Git and EAS uploads. Older working copies can still contain local Flutter files; back up any native edits before running `npm run prebuild`, which replaces `ios/` and `android/` with Expo projects. Fresh clones generate Expo projects directly.

PR checks run `npm ci`, TypeScript, regression tests, Expo dependency validation, iOS/Android native generation, and JavaScript/Hermes exports. Native generation uses synthetic Firebase configuration so fork PRs can run without credentials. This verifies project generation and bundling; signed builds and real Firebase/device behavior require the build setup below.

The **Build Expo app** workflow builds an Android production APK on pushes to `main`. Manual dispatch also supports iOS and development/preview profiles. EAS hosts the resulting binaries; the workflow uploads the build result JSON with their artifact links. Store submission is a separate operation.

Before running cloud builds:

1. Link the app to the organization's EAS project and configure signing credentials with EAS CLI. Set the repository secret `EXPO_TOKEN` and variable `EXPO_PROJECT_ID`; set `EXPO_OWNER` when an organization owner is required. Use the same project ID for local EAS commands.
2. In each EAS environment used (`development`, `preview`, `production`), configure file variables `GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICE_INFO_PLIST` with the real Firebase files. `app.config.js` reads these paths and falls back to the gitignored root files for local builds. The former GitHub `GOOGLE_SERVICES_JSON` secret is not automatically an EAS file variable.
3. Complete one interactive build per platform to establish the signing credentials needed by non-interactive CI.

See [Expo native generation](https://docs.expo.dev/workflow/continuous-native-generation/) and [EAS builds from CI](https://docs.expo.dev/build/building-on-ci/). Organization workflow automation must preserve these Expo workflows instead of restoring the old Flutter templates.

## Flow

1. Home → **Scan QR code**
2. QR payload: `{"apiEndpoint": "https://host/path"}` (scheme defaults to `https://`)
3. App POSTs `{"fcmToken": "..."}` to `apiEndpoint`; server responds `201`
4. Push notifications arrive via FCM (foreground alert; background handler in `index.ts`)
5. Restoring a linked endpoint uploads the current token; subsequent token rotations update its registration automatically.

## Layout

- `index.ts` – background FCM handler, root registration
- `App.tsx` – providers, Feed/Settings tabs, Scan modal
- `src/theme.ts` – palette (light/dark), spacing, radii, fonts
- `src/components/ui.tsx` – native text, icons, buttons, section headers, and empty states
- `src/components/TabBar.tsx`
- `src/screens/` – `FeedScreen` (linked band + event list), `SettingsScreen`, `ScanScreen` (expo-camera)
- `src/store.tsx` – linked endpoint (AsyncStorage), session events, token, permission
- `src/services/` – `notifications.ts` (FCM), `api.ts` (QR parse, token POST)
- `docs/google-firebase/` – Firebase project setup guide

Design: beige ground, white rounded cards, brown actions, and native system typography. Dark appearance uses espresso and brown surfaces. Navigation floats in a glass surface, with blur and accessibility fallbacks. Hosts and payload fields use selectable monospace text. See [the current UI preview](docs/ui-options/README.md) and [design system](DESIGN.md).

## TODOs

- [ ] open app from push notification
- [x] update visual appearance
- [ ] update app name / description
- [x] replace Flutter CI workflows with Expo validation and EAS builds
- [ ] configure EAS project, Firebase file variables, and signing credentials; verify native builds and physical-device delivery
