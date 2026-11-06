module.exports = ({ config }) => ({
  ...config,
  owner: process.env.EXPO_OWNER || config.owner,
  ios: {
    ...config.ios,
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || config.ios.googleServicesFile,
  },
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || config.android.googleServicesFile,
  },
  extra: {
    ...config.extra,
    ...(process.env.EXPO_PROJECT_ID ? { eas: { projectId: process.env.EXPO_PROJECT_ID } } : {}),
  },
});
