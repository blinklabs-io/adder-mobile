import 'package:flutter_test/flutter_test.dart';
import 'package:snek/module/qr_scanner_module.dart';

void main() {
  test('setQrText updates the qrText observable correctly', () {
    final qrScanner = QrScannerModule();

    // Verify initial value
    expect(qrScanner.qrText.value, '');

    // Update the value
    qrScanner.setQrText('QR text');

    // Verify updated value
    expect(qrScanner.qrText.value, 'QR text');
  });
}
