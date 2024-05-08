import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:adder/services/notification_service.dart';
import 'package:adder/views/adder_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService().initNotifications();
  runApp(const Adder());
}
