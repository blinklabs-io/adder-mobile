import 'package:get/get.dart';

class QrScannerModule extends GetxController {
  final qrText = ''.obs;

  void setQrText(String text) {
    qrText.value = text;
  }
}
