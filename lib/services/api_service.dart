import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:logger/logger.dart';

var logger = Logger();

class ApiService {
  final Dio dio = Dio();

  Future<bool> sendFcmToken(String url) async {
    final fcmToken = await FirebaseMessaging.instance.getToken();
    logger.d("FCM token: $fcmToken");
    logger.d("FCM url: $url");

    dio.options.followRedirects = true;
    dio.options.maxRedirects = 5;

    try {
      final response = await dio.post(
        url,
        data: {
          'fcmToken': fcmToken,
        },
      );

      if (response.statusCode == 201) {
        logger.d("FCM token sent successfully");
        return true;
      } else {
        logger.d("Failed to send FCM token. Status code: ${response.statusCode}");
        return false;
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        logger.d("Network timeout error: $e");
      } else if (e.type == DioExceptionType.connectionError) {
        logger.d("Network socket error: ${e.error}");
      } else {
        logger.d("Network error: $e");
      }
      return false;
    } catch (e) {
      logger.d("Error sending FCM token: $e");
      return false;
    }
  }
}
