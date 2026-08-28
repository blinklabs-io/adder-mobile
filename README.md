# adder-mobile

Mobile app for receiving adder push notifications. Expo (React Native) + Firebase Cloud Messaging.

## Setup

```sh
npm install
# drop Firebase config at repo root (gitignored):
#   google-services.json  (Android)  GoogleService-Info.plist (iOS)
npx expo prebuild --clean   # generates ios/ and android/
npx expo run:ios            # or run:android
```

Firebase Messaging needs native code, so the app runs in a dev build, not Expo Go.
Cloud builds: `eas build --profile development|preview|production`.

## Flow

1. Home → **Scan QR code**
2. QR payload: `{"apiEndpoint": "https://host/path"}` (scheme defaults to `https://`)
3. App POSTs `{"fcmToken": "..."}` to `apiEndpoint`; server responds `201`
4. Push notifications arrive via FCM (foreground alert; background handler in `index.ts`)

## Layout

- `index.ts` – background FCM handler, root registration
- `App.tsx` – providers, Feed/Settings tabs, Scan modal
- `src/theme.ts` – palette (light/dark), spacing, radii, fonts
- `src/components/ui.tsx` – Display/Body/Mono/Eyebrow text, Rule, SectionHeader, PillButton, TipMark, Empty
- `src/components/TabBar.tsx`
- `src/screens/` – `FeedScreen` (linked band + event list), `SettingsScreen`, `ScanScreen` (expo-camera)
- `src/store.tsx` – linked endpoint (AsyncStorage), session events, token, permission
- `src/services/` – `notifications.ts` (FCM), `api.ts` (QR parse, token POST)
- `assets/fonts/` – Space Grotesk (display face, OFL)
- `docs/google-firebase/` – Firebase project setup guide

Design: warm paper/ink, copper accent, monospace for hosts and payload fields. Rules instead of boxes; one inverted "tip band" hero per screen.

## TODOs

- [ ] open app from push notification
- [ ] update visual appearance
- [ ] update app name / description
- [ ] replace Flutter CI workflows (`.github/workflows/publish.yml`, `pr.yml`) with EAS builds
