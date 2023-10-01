import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:logger/logger.dart';

var logger = Logger();

Future<void> _onBackgroundMessage(RemoteMessage message) async {
  logger.d('Title: ${message.notification?.title}');
  logger.d('Body: ${message.notification?.body}');
  logger.d('Payload: ${message.data}');
}

class FirebaseApi {
  final _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initNotifications() async {
    await _firebaseMessaging.requestPermission();
    final fCMToken = await _firebaseMessaging.getToken();
    logger.d("fCMToken: $fCMToken");
    FirebaseMessaging.onBackgroundMessage(_onBackgroundMessage);
  }
}
