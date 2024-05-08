import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'home_view.dart';

class Adder extends StatelessWidget {
  const Adder({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      // Title is the app name
      title: 'Snek',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Color.fromARGB(255, 203, 158, 110)),
        useMaterial3: true,
      ),
      home: const HomeView(title: 'Adder Mobile'),
    );
  }
}
