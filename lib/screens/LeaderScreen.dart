import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../utils/GlobalData.dart';
import '../utils/getAPI.dart';

class LeaderScreen extends StatefulWidget {
  @override
  _LeaderScreenState createState() => _LeaderScreenState();

}

class _LeaderScreenState extends State<LeaderScreen> {
  List<dynamic> leaderboard = [];

  @override
  void initState() {
    super.initState();
    fetchLeaderboard();
  }


  Future<void> fetchLeaderboard() async {
    final url = Uri.parse('http://cop433103.com:5000/api/leaderboard');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          leaderboard = data['leaderboard'];
        });
      } else {
        print('Error: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching leaderboard: $e');
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1220), // Dark navy background
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildMainContent(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Hello ${GlobalData.firstName}!',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold,)
          ),
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  minimumSize: Size(80, 30),
                  padding: EdgeInsets.symmetric(horizontal: 15),
                ),
                child: const Text('Wheel Screen',
                  style:TextStyle(
                    color: Colors.white,
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  GlobalData.clear();
                  Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  minimumSize: Size(80, 30),
                  padding: EdgeInsets.symmetric(horizontal: 10),

                ),
                child: const Text('Log Out',
                  style:TextStyle(
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMainContent() {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Leaderboard',
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: leaderboard.length,
              itemBuilder: (context, index) {
                final player = leaderboard[index];
                return Card(
                  color: const Color(0xFF1C2333),
                  margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: index == 0
                          ? Colors.amber
                          : index == 1
                          ? Colors.grey
                          : index == 2
                          ? Colors.brown
                          : Colors.blue,
                      child: Text('${player['rank']}', style: const TextStyle(color: Colors.white)),
                    ),
                    title: Text('${player['FirstName']} (${player['Login']})',
                        style: const TextStyle(color: Colors.white)),
                    subtitle: Text('Credits: ${player['Credits']}',
                        style: const TextStyle(color: Colors.white70)),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

