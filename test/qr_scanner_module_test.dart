import 'package:flutter_test/flutter_test.dart';
import 'package:snek/viewmodels/qr_scanner_viewmodel.dart';

void main() {
  test('setQrText updates the qrText observable correctly', () {
    final qrScanner = QrScannerViewModel();

    // Verify initial value
    expect(qrScanner.qrText.value, '');

    // Update the value
    qrScanner.setQrText('QR text');

    // Verify updated value
    expect(qrScanner.qrText.value, 'QR text');
  });
}
