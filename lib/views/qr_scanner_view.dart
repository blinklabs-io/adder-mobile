import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:snek/module/qr_scanner_module.dart';

var logger = Logger();

class QrScannerView extends StatelessWidget {
  final qrKey = GlobalKey(debugLabel: 'QR');
  final qrScannerModule = Get.put(QrScannerModule());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
            ),
          ),
          ElevatedButton(
            onPressed: () => Get.back(),
            child: Text('Close'),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    controller.scannedDataStream.listen((scanData) {
      if (scanData.code != null) {
        // Pause camera scanner
        controller.pauseCamera();
        qrScannerModule.setQrText(scanData.code!);
        logger.d("QR code: ${scanData.code}");

        // Display a dialog with the content of the QR code
        Future.delayed(Duration(milliseconds: 500), () {
          Get.dialog(
            AlertDialog(
              title: Text('QR Code Found'),
              content: Text(scanData.code!),
              actions: [
                ElevatedButton(
                  onPressed: () {
                    Get.back(); // Close the dialog
                    Get.back(); // Close the QR scanner view
                  },
                  child: Text('OK'),
                ),
              ],
            ),
          );
        });
        // Make API call here
        // Close the scanner
        Get.back();
      } else {
        logger.d("QR code is null");
      }
    });
  }
}
