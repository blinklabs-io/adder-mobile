import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'home_page.dart';

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
      home: const HomePage(title: 'Snek Mobile'),
    );
  }
}
