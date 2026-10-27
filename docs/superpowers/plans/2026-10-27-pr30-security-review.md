# PR 30 security review fixes

**Goal:** Address wolf31o2's October review findings on PR 30.

**Approach:** Keep the existing Expo UI and registration queue. Scope EAS credentials to their consumers, remove background payload logging, and serialize deregistration/token revocation with linking and automatic registration.

**Sources:** PR 30 discussions r4394554826, r4370884654, r4373061315; Adder server `output/push/api_routes.go` and `fcm_repository.go` (`DELETE /fcm/{token}`, 204 or already-absent 404).

**Constraints:** Preserve the existing PR history and HTTPS endpoint validation. Do not merge, dispatch EAS builds, send real pushes, or post review replies. Work on the existing clean PR branch.

## Tasks

- [x] Limit `EXPO_TOKEN` to the configuration check and EAS build step; validate the parsed workflow. Omit the pinned Expo setup action token input because its implementation exports the credential job-wide.
- [x] Add a failing background-handler privacy regression, remove payload logging, and verify the handler still registers before the app.
- [x] Add failing regressions for server token deletion, Firebase revocation before local unlink, replacement endpoints receiving fresh tokens, revocation failures, and pending registration/restore races.
- [x] Add `removeFcmToken(url, token): Promise<boolean>` and `deleteFcmToken(): Promise<void>` using the verified server/Firebase contracts.
- [x] Make `unlink(): Promise<boolean>` and endpoint replacement share the registration queue. Keep the link on revocation failure and provide a Settings retry message. Suppress stale automatic uploads and initial token reads during revocation.
- [x] Run Jest, TypeScript, workflow validation, Expo dependency compatibility, clean installation, and diff review. Recheck earlier review items at the current head; report device/build boundaries separately.

## Review focus

- A successful pending POST must be revoked even when a newer unlink supersedes it.
- A delayed persisted-endpoint read must finish before cleanup, without restoring stale UI state.
- A refresh or initial token read during revocation must never re-register an invalidated token.
- Server, Firebase, or storage failures must report failure and leave retryable state.
- A replacement registration failure must leave the previous service revoked.

## Progress

- Baseline: PR head `10b3d34`; local branch fast-forwarded without conflicts. Existing 14 Jest tests pass.
- Earlier review fixes are present: public registry, Expo workflows/native generation, token refresh subscription, and committed UI captures. Their GitHub threads remain open.
- Security review found persistence rollback, ambiguous POST responses, cleanup-pending uploads, uploaded-token selection, late callbacks, and restore retry gaps. Each was reproduced in a failing regression before its fix. The expanded suite passes 40 tests, including legitimate refreshes during replacement acquisition. Final independent review cleared the requested scope.
- Expo compatibility required patch updates to Expo 57.0.31, dev client 57.0.20, and splash screen 57.0.10. Versions remain within SDK 57.
- Source verification: the pinned Expo action's `src/expo.ts` exports the token globally. Its tokenless setup installs the CLI; the build command authenticates through step-local environment.
- Final verification: clean `npm ci` using empty user/global npm configuration and a fresh cache; 40 Jest tests; TypeScript; Expo compatibility; actionlint 1.7.7; both platform native projects generated from synthetic Firebase fixtures; both platform Hermes exports; `git diff --check`. All passed. Eleven listed screenshot files have valid PNG headers.
- Existing CI at the previous head failed Expo compatibility; the patch updates address that failure. Earlier DCO and Conventional Commits failures remain in preserved history.
- `npm audit` reports four high-severity findings in existing Expo tooling dependency chains. The affected `zod` 3.25.76 and `brace-expansion` 5.0.9 versions are unchanged from the prior head; forced Expo downgrades and unrelated dependency changes are outside this review fix.
- Real Firebase/device revocation, push delivery, signed native builds, and EAS project credentials remain unverified. No real pushes, EAS builds, merge, or review-thread messages were sent.
