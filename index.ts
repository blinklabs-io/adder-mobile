import { registerRootComponent } from 'expo';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';

// Must be registered outside the React tree, before the app mounts.
setBackgroundMessageHandler(getMessaging(), async () => {});

registerRootComponent(App);
