import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'home_view.dart';

class Snek extends StatelessWidget {
  const Snek({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      // Title is the app name
      title: 'Snek',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Color.fromARGB(255, 26, 97, 251)),
        useMaterial3: true,
      ),
      home: const HomeView(title: 'Snek Mobile'),
    );
  }
}
