import 'dart:convert';
import 'package:flutter/material.dart';
import '../utils/GlobalData.dart';
import '../utils/getAPI.dart';
import '../main.dart';
import 'package:video_player/video_player.dart';
import 'package:jwt_decoder/jwt_decoder.dart';


class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with RouteAware {
  bool isRegister = false;
  bool loginEmpty = false;
  bool passwordEmpty = false;
  bool firstNameEmpty = false;
  bool lastNameEmpty = false;
  bool emailEmpty = false;
  bool passReset = false;
  bool resendEmail = false;
  late VideoPlayerController _controller;

  String message = "Welcome!";
  String loginName = '', password = '', firstName = '', lastName = '', email = '';
  final TextEditingController loginController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.asset('assets/vidR.mp4')
      ..initialize().then((_) {
        setState(() {}); // Refresh after initialization
        _controller.play();
        _controller.setLooping(true);
      });
  }

  void updateMessage(String newMessage) {
    setState(() {
      message = newMessage;
    });
  }


  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final ModalRoute? route = ModalRoute.of(context);
    if (route is PageRoute) {
      routeObserver.subscribe(this, route);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  void didPopNext() {
    setState(() {
      message = "Welcome!";
      loginController.clear();
      passwordController.clear();
      loginName = '';
      password = '';
    });
  }


  Future<void> doLogin() async {
    setState(() {
      loginEmpty = loginController.text.trim().isEmpty;
      passwordEmpty = passwordController.text.trim().isEmpty;
    });

    if (loginEmpty || passwordEmpty) {
      updateMessage("Please fill in all login fields.");
      return;
    }

    updateMessage("Logging in...");
    String payload = json.encode({
      "login": loginName.trim(),
      "password": password.trim()
    });

    try {
      String url = 'http://cop433103.com:5000/api/login';
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String? token = jsonObject["accessToken"]?.toString() ?? "false";
      String error = jsonObject["error"]?.toString() ?? "Unknown error";

      if (error == "Login/Password incorrect") {
        updateMessage("Incorrect Login/Password");
        return;
      }
      else if(error == "Please verify your email before logging in") {
        updateMessage("Verify your email");
        setState(() {
          resendEmail = true;
          loginController.clear();
          passwordController.clear();
        });
        return;
      }
      else {
        Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
        String userId = decodedToken['_id'] ?? '';
        String firstName = decodedToken['firstName'] ?? '';
        String lastName = decodedToken['lastName'] ?? '';

        GlobalData.token = token;
        GlobalData.loginName = loginName;
        GlobalData.password = password;
        GlobalData.firstName = firstName;
        GlobalData.lastName = lastName;
        GlobalData.userId = userId;
        _controller.pause();
        Navigator.pushReplacementNamed(context, '/cards');
      }
    } catch (e) {
      updateMessage("Error: ${e.toString()}");
    }
  }
  Future<void> doRegister() async {
    setState(() {
      loginEmpty = loginController.text.trim().isEmpty;
      passwordEmpty = passwordController.text.trim().isEmpty;
      firstNameEmpty = firstNameController.text.trim().isEmpty;
      lastNameEmpty = lastNameController.text.trim().isEmpty;
      emailEmpty = emailController.text.trim().isEmpty;
    });

    if (loginEmpty ||
        passwordEmpty ||
        firstNameEmpty ||
        lastNameEmpty ||
        emailEmpty) {
      updateMessage("Please fill in all registration fields.");
      return;
    }

    String payload = json.encode({
      "login": loginController.text.trim(),
      "password": passwordController.text.trim(),
      "firstname": firstNameController.text.trim(),
      "lastname": lastNameController.text.trim(),
      "email": emailController.text.trim()
    });


    try {
      String url = 'http://cop433103.com:5000/api/register';
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = jsonObject["error"]?.toString() ?? "Unknown error";

      if (error == "Email or username already exists") {
        updateMessage(error);
        return;
      }
      else if(error.isNotEmpty) {
          updateMessage(error);
          return;
      }

      updateMessage(jsonObject["message"] ?? "Please check your email to verify your account.");
      setState(() {
        isRegister = false;
        message = "Welcome!";
        loginController.clear();
        passwordController.clear();
        firstNameController.clear();
        lastNameController.clear();
        emailController.clear();
        loginName = '';
        password = '';
        firstName = '';
        lastName = '';
        email = '';
      });
    }catch (e) {
      updateMessage("Error: ${e.toString()}");
    }
  }
  Future<void> doPassReset() async {
    setState(() {
      emailEmpty = emailController.text.trim().isEmpty;
    });

    if (emailEmpty) {
      updateMessage("Please fill in the field.");
      return;
    }

    updateMessage("Sending Email...");

    String payload = json.encode({
      "email": emailController.text.trim()
    });
    String url = 'http://cop433103.com:5000/api/forgot-password';

    try {
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = (jsonObject["error"] ?? "").toString();
      String message = (jsonObject["message"] ?? "").toString();

      if (error.isNotEmpty) {
        updateMessage("Error");
        return;
      }
      else if(message.isNotEmpty) {
        updateMessage("Please check your email!");
        return;
      }
      else {
        updateMessage("An email was successfully sent");
        return;
      }
    }catch (e) {
      updateMessage("Error: ${e.toString()}");
    }

  }
  Future<void> doResend() async {
    setState(() {
      emailEmpty = emailController.text.trim().isEmpty;
    });

    if (emailEmpty) {
      updateMessage("Please enter an email in the field");
      return;
    }

    String payload = json.encode({
      "email": emailController.text.trim()
    });
    String url = 'http://cop433103.com:5000/api/resend-verification';

    try {
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = (jsonObject["error"] ?? "").toString();
      String message = (jsonObject["message"] ?? "").toString();

      if (error.isNotEmpty && error == "Email not found") {
        updateMessage(error);
        return;
      }
      else if(message.isNotEmpty && message == "Verification email sent successfully") {
        updateMessage("Verification Email Resent!");
        return;
      }

    }catch (e) {
      updateMessage("Error: ${e.toString()}");
    }


  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: _controller.value.isInitialized
                ? FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller.value.size.width,
                height: _controller.value.size.height,
                child: VideoPlayer(_controller),
              ),
            )
                : Container(color: Colors.black),
          ),

          Center(
            child: Container(
              width: 300,
              padding: EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(message,
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white
                      ),
                  ),
                  SizedBox(height: 10),
                  SizedBox(
                    width: 240,
                    height: 40,
                    child: TextField(
                      controller: (!passReset && !resendEmail) ? loginController : emailController,
                      onChanged: (text) => loginName = text,
                      decoration: InputDecoration(
                        labelText: (!passReset && !resendEmail) ? 'Username' : 'Email Address',
                        labelStyle: TextStyle(fontSize: 14),
                        filled: true,
                        fillColor: Colors.white60,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: loginEmpty || (passReset && emailEmpty) || (resendEmail && emailEmpty) ? Colors.red : Colors.black,
                            width: 1.0,
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 10),
                  if (!passReset && !resendEmail)...[
                    SizedBox(
                      width: 240,
                      height: 40,
                      child: TextField(
                        controller: passwordController,
                        obscureText: true,
                        onChanged: (text) => password = text,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: TextStyle(fontSize: 14),
                          filled: true,
                          fillColor: Colors.white60,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: passwordEmpty ? Colors.red : Colors.black,
                              width: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                  if (isRegister) ...[
                    SizedBox(height: 8),
                    SizedBox(
                      width: 240,
                      height: 40,
                      child: TextField(
                        controller: firstNameController,
                        onChanged: (text) => firstName = text,
                        decoration: InputDecoration(
                          labelText: 'First Name',
                          labelStyle: TextStyle(fontSize: 14 ),
                          filled: true,
                          fillColor: Colors.white60,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: firstNameEmpty ? Colors.red : Colors.black,
                              width: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 8),
                    SizedBox(
                      width: 240,
                      height: 40,
                      child: TextField(
                        controller: lastNameController,
                        onChanged: (text) => lastName = text,
                        decoration: InputDecoration(
                          labelText: 'Last Name',
                          labelStyle: TextStyle(fontSize: 14 ),
                          filled: true,
                          fillColor: Colors.white60,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: lastNameEmpty ? Colors.red : Colors.black,
                              width: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 8),
                    SizedBox(
                      width: 240,
                      height: 40,
                      child: TextField(
                        controller: emailController,
                        onChanged: (text) => email = text,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          labelStyle: TextStyle(fontSize: 14 ),
                          filled: true,
                          fillColor: Colors.white60,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: emailEmpty ? Colors.red : Colors.black,
                              width: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                  SizedBox(height: !passReset ? 8 : 0),
                  SizedBox(
                    width: 240,
                    height: 25,
                    child: ElevatedButton(
                      onPressed: isRegister ? doRegister : !passReset ? !resendEmail ? doLogin : doResend : doPassReset,

                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white60,
                        foregroundColor: Colors.black54,
                        side: BorderSide(color: Colors.black, width: 0.5),
                      ),
                      child: Text(isRegister ? 'Register' : !passReset ? !resendEmail ? 'Login' : 'Resend Verification Email' : 'Send Email'),
                    ),
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [ GestureDetector(
                        onTap: () {

                          if (!passReset && !resendEmail)updateMessage("Fill the boxes to register!");

                          (isRegister || passReset || resendEmail) ? setState(() {
                            isRegister = false;
                            passReset = false;
                            resendEmail = false;
                            message = "Welcome!";
                            loginController.clear();
                            passwordController.clear();
                            firstNameController.clear();
                            lastNameController.clear();
                            emailController.clear();
                            loginName = '';
                            password = '';
                            loginEmpty = false;
                            passwordEmpty = false;
                            firstNameEmpty = false;
                            lastNameEmpty = false;
                            emailEmpty = false;
                          }) : setState(() {
                            isRegister = true;
                            loginEmpty = false;
                            passwordEmpty = false;
                          });
                        },
                      child: Text(
                          isRegister ? 'Already a member? Click HERE' : passReset || resendEmail ? 'Return to Login? Click HERE' : 'Create Account',
                          style: TextStyle(
                            color: Colors.white,
                            decoration: TextDecoration.underline,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                      ),
                    ),
                      if (!isRegister && !passReset && !resendEmail) ... [
                        SizedBox(width: 2),
                        Text(
                          '|',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 2),
                        GestureDetector(
                          onTap: () {
                            updateMessage("Reset Password");
                            setState(() {
                              passReset = true;

                            });
                          },
                          child: Text(
                            'Forgot Password',
                            style: TextStyle(
                              color: Colors.white,
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
