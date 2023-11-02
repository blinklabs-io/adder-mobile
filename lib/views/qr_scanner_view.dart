import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:snek/viewmodels/qr_scanner_viewmodel.dart';

var logger = Logger();

class QrScannerView extends StatelessWidget {
  final qrKey = GlobalKey(debugLabel: 'QR');
  final qrScannerViewModel = Get.put(QrScannerViewModel());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Scan QR Code'),
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () => Get.back(),
        ),
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
            ),
          ),
          Obx(() {
            if (qrScannerViewModel.snackbarMessage.isNotEmpty) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                Get.snackbar('Notification', qrScannerViewModel.snackbarMessage.value);
                qrScannerViewModel.snackbarMessage.value = '';
              });
            }
            return SizedBox.shrink();
          }),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    controller.scannedDataStream.listen((scanData) async {
      if (scanData.code != null) {
        // Pause camera scanner
        await controller.pauseCamera();
        logger.d("QR code: ${scanData.code}");
        await qrScannerViewModel.setQrText(scanData.code!);
        await controller.resumeCamera();
      } else {
        logger.d("QR code is null");
      }
    });
  }
}
