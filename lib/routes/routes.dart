import 'package:flutter/material.dart';
import 'package:poos_project/screens/LoginScreen.dart';
import 'package:poos_project/screens/CardsScreen.dart';
import 'package:poos_project/screens/LeaderScreen.dart';

class Routes {
  static const String LOGINSCREEN = '/login';
  static const String CARDSSCREEN = '/cards';
  static const String LEADERSCREEN = '/leader';


// Define routes for pages in the app
  static Map<String, Widget Function(BuildContext)> get getroutes =>
      {
        '/': (context) => LoginScreen(),
        LOGINSCREEN: (context) => LoginScreen(),
        CARDSSCREEN: (context) => CardsScreen(),
        LEADERSCREEN: (context) => LeaderScreen(),
      };
}