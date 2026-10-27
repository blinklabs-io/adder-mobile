// Synthetic build-only configuration. These values cannot connect to a Firebase project.
// Exclusive writes protect a developer's real local configuration.
const { writeFileSync } = require('node:fs');
const { expo } = require('../app.json');

writeFileSync('google-services.json', JSON.stringify({
  project_info: {
    project_number: '123456789012',
    project_id: 'adder-ci-placeholder',
    storage_bucket: 'adder-ci-placeholder.appspot.com',
  },
  client: [{
    client_info: {
      mobilesdk_app_id: '1:123456789012:android:0000000000000000',
      android_client_info: { package_name: expo.android.package },
    },
    oauth_client: [],
    api_key: [{ current_key: 'AIzaSy000000000000000000000000000000000' }],
    services: { appinvite_service: { other_platform_oauth_client: [] } },
  }],
  configuration_version: '1',
}, null, 2), { flag: 'wx' });

writeFileSync('GoogleService-Info.plist', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>API_KEY</key><string>AIzaSy000000000000000000000000000000000</string>
  <key>GCM_SENDER_ID</key><string>123456789012</string>
  <key>PLIST_VERSION</key><string>1</string>
  <key>BUNDLE_ID</key><string>${expo.ios.bundleIdentifier}</string>
  <key>PROJECT_ID</key><string>adder-ci-placeholder</string>
  <key>STORAGE_BUCKET</key><string>adder-ci-placeholder.appspot.com</string>
  <key>GOOGLE_APP_ID</key><string>1:123456789012:ios:0000000000000000</string>
  <key>IS_GCM_ENABLED</key><true/>
</dict></plist>
`, { flag: 'wx' });
