import { registerRootComponent } from 'expo';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';

// Must be registered outside the React tree, before the app mounts.
setBackgroundMessageHandler(getMessaging(), async (message) => {
  console.log('Background message', message.notification?.title, message.notification?.body, message.data);
});

registerRootComponent(App);
