import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:snek/services/notification_service.dart';
import 'package:snek/views/snek_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService().initNotifications();
  runApp(const Snek());
}
