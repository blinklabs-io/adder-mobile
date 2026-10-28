# Device validation

Live testing is deferred at Brian's request. Automated tests validate the application logic with synthetic messages; they do not establish Firebase registration, APNs delivery, native permission behavior, or physical-camera pairing.

## Existing Firebase project setup

Use existing app registrations for `io.blinklabs.adder` on iOS and Android. Older `io.blinklabs.snek` registrations need replacement app registrations in the intended Firebase project, followed by updated client config files. Keep the existing project unless the project owner chooses otherwise.

Place `google-services.json` and `GoogleService-Info.plist` at the app root, or set `GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICE_INFO_PLIST` to their paths. These files remain ignored by Git.

Run `npm run check:firebase` before a device build. It checks package/bundle identity, matching Firebase project/sender IDs, app registration IDs, and client API configuration. It rejects synthetic CI files and prints no keys or config contents. A passing check does not verify APNs credentials or push delivery.

For iOS, the existing Firebase project also needs a valid APNs key/certificate and native signing with the Push Notifications capability. Use a development build; Expo Go does not load Firebase Messaging. Do not use synthetic CI configuration for delivery checks.

## Deferred test matrix

Use a dedicated test Adder instance and synthetic event content. Record platform, OS, app commit, build mode, and pass/fail evidence. Avoid capturing tokens or private payloads in screenshots or logs.

| Flow | Expected result | Status |
| --- | --- | --- |
| Scan a valid HTTPS endpoint QR | One registration, linked endpoint visible | Deferred |
| Scan an invalid or HTTP QR | Actionable error, no token uploaded | Deferred |
| Receive a foreground transaction | One feed entry; CIP20 text readable | Deferred |
| Tap a background notification from Settings or scanner | Feed opens, scanner closes, matching event expands | Deferred |
| Tap a notification from a closed app | Saved link restores before the event opens | Deferred |
| Deliver and open the same message | One event row | Deferred |
| Deny notifications, then open notification settings | System settings opens; returning updates permission status | Deferred |
| Request notifications on Android 13+ | Native runtime permission is requested and denial is reflected | Deferred |
| Make registration endpoint stop responding | Each HTTP wait ends within 15 seconds; retry remains available | Deferred |
| Retry a failed registration | Current token registers without rescanning or rotation | Deferred |
| Rotate the Firebase token | Current linked service receives the new token | Deferred |
| Unlink with the service offline | Failure stays visible and automatic registration stays blocked; explicit unlink retry cleans up | Deferred |
| Successfully unlink | Server registrations removed, Firebase token revoked, feed cleared; old service cannot deliver new pushes | Deferred |
| Replace the endpoint | Old registration revoked; new service receives a fresh token; older timestamped notifications stay hidden | Deferred |
| CIP20 in structured data or legacy body suffix | Selectable text and raw metadata are both available | Deferred |
| Malformed or encrypted metadata | Generic event remains readable; invalid metadata is not rendered as plaintext | Deferred |
| Large text and dark appearance | Content and recovery actions remain readable and reachable above navigation | Deferred |

The 15-second timeout applies to each app HTTP request. Queueing, multiple token deletions, Firebase native operations, and OS scheduling can make the complete action take longer.

FCM messages without a source endpoint cannot be attributed cryptographically to a service. New links store their activation time and reject older timestamped notifications; legacy links have no historical activation timestamp. Stronger provenance would require a coordinated server payload change.
