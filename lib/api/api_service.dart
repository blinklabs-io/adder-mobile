import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';

class ApiService {
  final String baseUrl;

  ApiService(this.baseUrl);

  Future<void> sendQrData(String qrData) async {
    final fcmToken = await FirebaseMessaging.instance.getToken();

    final response = await http.post(
      Uri.parse(baseUrl),
      body: {
        'qrData': qrData,
        'fcmToken': fcmToken,
      },
    );

    if (response.statusCode != 200) {
      print("Can't read data");
    }
  }
}
