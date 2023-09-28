import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:snek/api/firebase_api.dart';
import 'package:snek/views/snek_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await FirebaseApi().initNotifications();
  runApp(const Snek());
}
