# How to setup Google Firebase

## Create a new project in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on `Create project`
  ![Create project](/docs/google-firebase/images/firebase-1.jpeg)
3. Enter the project name and click on `Continue`
  ![Create project](/docs/google-firebase/images/firebase-2.jpeg)
4. Click on `Create project`
  ![Create project](/docs/google-firebase/images/firebase-3.jpeg)
5. Creating your project
  ![Create project](/docs/google-firebase/images/firebase-4.jpeg)
6. Project created (`Continue`)
  ![Create project](/docs/google-firebase/images/firebase-5.jpeg)
7. Select `Android` icon
  ![Create project](/docs/google-firebase/images/firebase-6.jpeg)
8. Enter your package name and click on `Register app`
  ![Register app](/docs/google-firebase/images/firebase-7.jpeg)
9. Download `google-services.json` file and click on `Next`. For step 3, click `Next` and for step 4, click `Continue to console`.
  ![Project settings](/docs/google-firebase/images/firebase-8.jpeg)
10. Go to `Project Overview` and click `Project settings`
  ![Project settings](/docs/google-firebase/images/firebase-9.jpeg)
11. Select tab `Service accounts` and `Generate new private key` for your project and store the file. This file will be used to authenticate your project with Firebase. When you start `Snek` you need to specify the path to this file. For more information please refer to the `README` file in [Snek](https://github.com/blinklabs-io/snek/blob/main/README.md#push-notifications).
  ![Service account](/docs/google-firebase/images/firebase-10.jpeg)

## Rename Snek-Mobile to your package name

```bash
git clone https://github.com/blinklabs-io/snek-mobile.git
cd snek-mobile
flutter pub global activate rename
# Get name of app
rename getAppName --targets android,ios
# Get bundle id of app
rename getBundleId --targets android,ios
# Rename app to your app name and bundle id
rename setAppName --targets ios,android --value "appname"
rename setBundleId --targets android,ios --value "com.yourcompany.appname"
```

Place `google-services.json` in `android/app/google-services.json`

To create a release build run

```bash
flutter build apk --release
```

this will create an `apk` file in `build/app/outputs/apk/release` directory. You can install this `apk` file on your Android device.

The service account file has to be used with [Snek](https://github.com/blinklabs-io/snek/blob/main/README.md#push-notifications) to send push notifications to your app using Snek and Firebase.
