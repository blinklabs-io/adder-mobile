const { validateFirebaseConfig } = require('../scripts/check-firebase-config.cjs');
const { expo } = require('../app.json');

let android, ios;
beforeEach(() => {
  android = { project_info: { project_id: 'test-project', project_number: '123' }, client: [{
    client_info: { android_client_info: { package_name: expo.android.package }, mobilesdk_app_id: '1:123:android:test' },
    api_key: [{ current_key: 'private-test-value' }],
  }] };
  ios = { PROJECT_ID: 'test-project', GCM_SENDER_ID: '123', BUNDLE_ID: expo.ios.bundleIdentifier,
    GOOGLE_APP_ID: '1:123:ios:test', API_KEY: 'private-test-value' };
});

test('accepts existing Firebase app registrations matching both Adder identifiers', () => {
  expect(validateFirebaseConfig(android, ios, expo)).toEqual([]);
});

test('rejects old app names after the Adder rename', () => {
  android.client[0].client_info.android_client_info.package_name = 'io.blinklabs.snek';
  ios.BUNDLE_ID = 'io.blinklabs.snek';
  expect(validateFirebaseConfig(android, ios, expo)).toEqual(expect.arrayContaining([
    expect.stringContaining('Android package'), expect.stringContaining('iOS bundle'),
  ]));
});

test('rejects cross-project app registrations without disclosing configuration values', () => {
  ios.PROJECT_ID = 'another-private-project';
  ios.GCM_SENDER_ID = '456';
  const errors = validateFirebaseConfig(android, ios, expo);
  expect(errors).toEqual(expect.arrayContaining([expect.stringContaining('same Firebase project')]));
  expect(JSON.stringify(errors)).not.toMatch(/private-test-value|another-private-project/);
});

test('rejects synthetic CI configuration as proof of real Firebase readiness', () => {
  android.project_info.project_id = 'adder-ci-placeholder';
  ios.PROJECT_ID = 'adder-ci-placeholder';
  expect(validateFirebaseConfig(android, ios, expo)).toContain('Synthetic CI configuration cannot verify device delivery.');
});

test('rejects missing app registration fields instead of passing on matching undefined values', () => {
  expect(validateFirebaseConfig({}, {}, expo).length).toBeGreaterThan(0);
});

test('CLI rejects successfully parsed null configuration without printing config contents', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { spawnSync } = require('node:child_process');
  const plist = require('@expo/plist').default;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adder-config-test-'));
  try {
    fs.writeFileSync(path.join(directory, 'android.json'), 'null');
    fs.writeFileSync(path.join(directory, 'ios.plist'), plist.build(ios));
    const result = spawnSync(process.execPath, [path.resolve('scripts/check-firebase-config.cjs')], {
      encoding: 'utf8', env: { ...process.env, GOOGLE_SERVICES_JSON: path.join(directory, 'android.json'), GOOGLE_SERVICE_INFO_PLIST: path.join(directory, 'ios.plist') },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).not.toContain('private-test-value');
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
