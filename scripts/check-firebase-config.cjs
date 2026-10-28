const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const plist = require('@expo/plist').default;

function validateFirebaseConfig(android, ios, expo) {
  android ??= {};
  ios ??= {};
  const errors = [];
  const clients = Array.isArray(android.client) ? android.client : [];
  const client = clients.find(item => item?.client_info?.android_client_info?.package_name === expo.android.package);
  if (!client) errors.push('Android package must match the Adder app configuration.');
  if (ios.BUNDLE_ID !== expo.ios.bundleIdentifier) errors.push('iOS bundle must match the Adder app configuration.');
  const project = android.project_info;
  if (!project?.project_id || !project?.project_number || project.project_id !== ios.PROJECT_ID
    || String(project.project_number) !== String(ios.GCM_SENDER_ID)) {
    errors.push('Both platform registrations must use the same Firebase project and sender ID.');
  }
  if (project?.project_id === 'adder-ci-placeholder' || ios.PROJECT_ID === 'adder-ci-placeholder') {
    errors.push('Synthetic CI configuration cannot verify device delivery.');
  }
  const androidAppId = client?.client_info?.mobilesdk_app_id;
  if (typeof androidAppId !== 'string' || !androidAppId.startsWith(`1:${project?.project_number}:android:`)
    || typeof ios.GOOGLE_APP_ID !== 'string' || !ios.GOOGLE_APP_ID.startsWith(`1:${ios.GCM_SENDER_ID}:ios:`)) {
    errors.push('Both platform Firebase app IDs must match their sender ID and platform.');
  }
  if (!Array.isArray(client?.api_key) || !client.api_key.some(key => typeof key?.current_key === 'string' && key.current_key.length > 0)
    || typeof ios.API_KEY !== 'string' || !ios.API_KEY) {
    errors.push('Both Firebase app registrations must include their client API configuration.');
  }
  return errors;
}

if (require.main === module) {
  const { expo } = require('../app.json');
  let android, ios, readable = false;
  try {
    android = JSON.parse(readFileSync(resolve(process.env.GOOGLE_SERVICES_JSON || expo.android.googleServicesFile), 'utf8'));
    ios = plist.parse(readFileSync(resolve(process.env.GOOGLE_SERVICE_INFO_PLIST || expo.ios.googleServicesFile), 'utf8'));
    readable = true;
  } catch {
    console.error('Firebase config files are missing or unreadable. Set GOOGLE_SERVICES_JSON and GOOGLE_SERVICE_INFO_PLIST, or place the existing config files at the app root.');
    process.exitCode = 1;
  }
  if (readable) {
    const errors = validateFirebaseConfig(android, ios, expo);
    if (errors.length) {
      for (const error of errors) console.error(error);
      process.exitCode = 1;
    } else {
      console.log('Firebase config matches Adder app identifiers and uses one project. APNs, signing, and real delivery still require device validation.');
    }
  }
}

module.exports = { validateFirebaseConfig };
