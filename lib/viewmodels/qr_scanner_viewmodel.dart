import 'dart:convert';
import 'package:get/get.dart';
import 'package:snek/services/api_service.dart';
import 'package:snek/models/qr_code_model.dart';

class QrScannerViewModel extends GetxController {
  final qrText = ''.obs;
  final isLoading = false.obs;
  final snackbarMessage = ''.obs;
  final ApiService apiService = ApiService();
  final Rx<QRCodeModel?> qrCodeModel = Rx<QRCodeModel?>(null);

  Future<void> setQrText(String text) async {
    isLoading.value = true;
    qrText.value = text;

    try {
      // Parse the QR code text to a QRCodeModel
      final data = json.decode(qrText.value);
      qrCodeModel.value = QRCodeModel.fromJson(data);

      if (qrCodeModel.value?.apiEndpoint != null) {
        // Ensure the URL starts with 'http://'
        final url = qrCodeModel.value!.apiEndpoint!;
        final fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'http://$url';
        final success = await apiService.sendFcmToken(fullUrl);

        if (success) {
          snackbarMessage.value = 'FCM token sent successfully';
        } else {
          snackbarMessage.value = 'Failed to send FCM token';
        }
      } else {
        snackbarMessage.value = "Invalid QR code";
      }
    } catch (e) {
      snackbarMessage.value = 'Failed to send FCM token';
    }

    isLoading.value = false;
  }
}
