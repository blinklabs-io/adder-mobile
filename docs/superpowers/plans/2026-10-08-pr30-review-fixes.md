# PR 30 Review Fixes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all four comments on PR 30 while retaining the current glass UI.

**Architecture:** Keep the Expo app and generate native projects from app configuration. Register restored endpoints and changed FCM tokens through the existing API contract. Preserve local legacy files while removing their tracked build inputs.

**Tech Stack:** Expo 57, React Native 0.86, React 19.2, TypeScript, Firebase Messaging, GitHub Actions, EAS.

**Spec:** https://github.com/blinklabs-io/adder-mobile/pull/30#pullrequestreview-5050919124

## Constraints

- Preserve brown/beige styling, glass navigation, and existing UI captures.
- Preserve local Flutter edits on disk; native build inputs must come from Expo.
- No merging, deployment, paid build dispatch, real push delivery, or review-thread messages.
- The server contract remains POST `{fcmToken}` with HTTP 201 indicating success.

## Review Focus

- Token refresh during asynchronous endpoint restoration must use the latest token.
- Unlinking must stop future automatic registrations.
- Registration failure must preserve the stored endpoint and allow later token refresh.
- Fork PR checks must run without Firebase secrets or Expo credentials.
- EAS archives must exclude Flutter native directories and accept Firebase file variables.

### Task 1: Restore public clean installs

- [x] Reproduce `npm ci --ignore-scripts` in a disposable checkout with an empty cache.
- [x] Set project registry to HTTPS npm; normalize lockfile URLs while preserving versions and integrity hashes.
- [x] Add only test/native-development dependencies required by the fixes.
- [x] Verify a clean install with an empty npm cache and no private credentials.

### Task 2: Refresh FCM registrations

- [x] Add provider regression tests for startup restoration, rotation, unlink, failure, and subscription cleanup; observe failures before implementation.
- [x] Expose `onFcmTokenRefresh(cb)` and pass the observed token to `sendFcmToken(url, token?)`.
- [x] Subscribe before reading the initial token; prevent an older initial read from replacing a refresh.
- [x] Register when restored endpoint and token are available; retain manual linking behavior.
- [x] Run the provider/API tests and TypeScript.

### Task 3: Complete build migration

- [x] Remove tracked legacy Flutter inputs while retaining their local files and ignoring them.
- [x] Replace Flutter PR checks with clean install, tests, typecheck, Expo dependency checks, native generation, and platform exports.
- [x] Replace Flutter publishing with EAS builds, retaining the existing main-branch build trigger and adding manual dispatch; document credentials/project setup.
- [x] Configure EAS file-variable Firebase paths and install the development client.
- [x] Verify workflows, generated native projects, and iOS/Android exports in a disposable checkout.

### Task 4: Verify review evidence and finish

- [x] Verify all PR screenshot URLs and the current 16 glass UI captures.
- [x] Review the combined diff, run final checks, and record exact remaining native/account boundaries.
- [x] Keep existing history intact; report older DCO and commit-message failures separately.

## Verification and remaining boundaries

- Original clean install reproduced HTTP 401 with empty npm credentials and an empty cache. Final `npm ci` passed with empty credentials and an empty cache; all 736 locked tarball URLs use `registry.npmjs.org`.
- Fourteen provider/API regression tests pass, including initial restoration, rotation, subscription cleanup, failed registration, delayed restoration, manual-link ordering, and unlink races. The missing behaviors were observed failing before their fixes.
- TypeScript, Expo dependency compatibility, workflow actionlint, generated iOS/Android projects, and both platform Hermes exports pass from a disposable clean source snapshot. Firebase files in this snapshot are synthetic build fixtures.
- Eleven existing PR screenshot URLs returned HTTP 200 image/png. Sixteen current glass captures are included with their original fixture/device limitations.
- Independent review found two registration races; both were reproduced and fixed.
- Cloud signing/build execution, EAS project identity, real Firebase configuration, physical QR pairing, push delivery, and final native glass interaction testing remain pending. The saved JaeBrian account confirms that the repository currently has only the legacy `GOOGLE_SERVICES_JSON` Actions secret and no Actions variables; EAS credentials and project mapping still need configuration.
- Earlier commits retain their DCO and Conventional Commits failures; their history is preserved.
- Existing automatic main-branch Android publishing is retained through EAS. This work does not dispatch a cloud build or submit to an app store.
