import 'dart:convert';
import 'package:flutter/material.dart';
import '../utils/GlobalData.dart';
import '../utils/getAPI.dart';
import 'dart:math';


class CardsScreen extends StatefulWidget {
  @override
  _CardsScreenState createState() => _CardsScreenState();

}

class _CardsScreenState extends State<CardsScreen> with SingleTickerProviderStateMixin {
  int? selectedChipIndex;
  Set<int> selectedNumbers = {};
  Set<String> selectedOptions = {};
  List<Map<String, dynamic>> currentBets = [];
  late AnimationController _controller;
  late Animation<double> _animation;
  double _currentAngle = 0;
  int winningNumber = 0;


  final chips = [
    {'label': '\$1', 'value': 1, 'color': Colors.red.shade900},
    {'label': '\$5', 'value': 5, 'color': Colors.green.shade900},
    {'label': '\$25', 'value': 25, 'color': Colors.blue.shade900},
    {'label': '\$100', 'value': 100, 'color': Colors.purple.shade900},
    {'label': '\$500', 'value': 500, 'color': Colors.black87},
    {'label': '\$1k', 'value': 1000, 'color': Colors.amber.shade700},
  ];


  final List<int> rouletteNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  @override
  void initState() {
    super.initState();
    getCredits();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 5));
    _animation = AlwaysStoppedAnimation(0);
  }



  void _spinWheel() {
    final randomIndex = Random().nextInt(rouletteNumbers.length);
    final chosenNumber = rouletteNumbers[randomIndex];

    final segmentSize = 360 / rouletteNumbers.length;
    const offset = 0;
    final targetAngle = (rouletteNumbers.length - randomIndex) * segmentSize; // reverse direction
    final adjustedTargetAngle = (targetAngle + offset) % 360;

    final spins = 4;
    final finalAngle = (spins * 360) + adjustedTargetAngle; // reset logic

    _animation = Tween<double>(
      begin: 0,
      end: finalAngle / 360,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _animation.addListener(() {
      setState(() {});
    });

    _controller.forward(from: 0).then((_) {
      _currentAngle = adjustedTargetAngle;
      setState(() {
        winningNumber = chosenNumber;
      });
      if (currentBets.isNotEmpty) {
        calculateWin();
      }
    });
  }

  void addFunds() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: const Color(0xFF1C2333),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Add Funds',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    for (var amount in [1, 5, 25, 100, 500, 1000])
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          minimumSize: const Size(100, 40),
                        ),
                        onPressed: () {
                          addCredits(amount);
                        },
                        child: Text('\$$amount',
                            style: const TextStyle(color: Colors.white)),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> getCredits() async {
    String payload = json.encode({
      "jwtToken": GlobalData.token,
    });

    try {
      String url = 'http://cop433103.com:5000/api/getcredits';
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = jsonObject["error"]?.toString() ?? "Unknown error";
      int credits = jsonObject['credits'];

      if(error.isEmpty){
        setState(() {
          GlobalData.credits = credits;
        });
      }
    }catch (e) {
      /*
      GlobalData.clear;
      Navigator.pushReplacementNamed(context, '/login');

       */
    }
  }

  Future<void> addCredits(int credits) async {
    String payload = json.encode({
      "jwtToken": GlobalData.token,
      "credits": credits
    });

    try {
      String url = 'http://cop433103.com:5000/api/addcredits';
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = jsonObject["error"]?.toString() ?? "Unknown error";

      if(error.isEmpty){
        setState(() {
          GlobalData.credits = GlobalData.credits + credits;
        });
      }
    }catch (e) {
      /*
      GlobalData.clear;
      Navigator.pushReplacementNamed(context, '/login');

       */
    }

  }

  Future<void> calculateWin() async {
    int totalWin = 0;

    for (var bet in currentBets) {
      int amount = bet['amount'];
      var target = bet['target'];
      String type = bet['type'];

      if (type == 'straight') {
        if (target == winningNumber) {
          totalWin += amount * 35;
        }
        else {
          totalWin -= amount;
        }
      } else if (type == 'outside') {
        bool winCondition = false;

        switch (target) {
          case 'RED':
            winCondition = redNumbers.contains(winningNumber);
            break;
          case 'BLACK':
            winCondition = winningNumber != 0 && !redNumbers.contains(winningNumber);
            break;
          case 'EVEN':
            winCondition = winningNumber != 0 && winningNumber % 2 == 0;
            break;
          case 'ODD':
            winCondition = winningNumber % 2 != 0;
            break;
          case '1-18':
            winCondition = winningNumber >= 1 && winningNumber <= 18;
            break;
          case '19-36':
            winCondition = winningNumber >= 19 && winningNumber <= 36;
            break;
        }

        if (winCondition) {
          totalWin += amount * 2;
        }
        else {
          totalWin -= amount;
        }
      }
    }

    String payload = json.encode({
      "jwtToken": GlobalData.token,
      "credits": totalWin
    });

    try {
      String url = 'http://cop433103.com:5000/api/addcredits';
      String response = await CardsData.getJson(url, payload);
      var jsonObject = json.decode(response);

      String error = jsonObject["error"]?.toString() ?? "Unknown error";

      if(error.isEmpty){
        setState(() {
          GlobalData.credits += totalWin;
          currentBets.clear();
        });
      }
    }catch (e) {
      /*
      GlobalData.clear;
      Navigator.pushReplacementNamed(context, '/login');

       */
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
            Expanded(child: _buildMainContent()),
          ],
        ),
      ),
    );
  }


  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Hello ${GlobalData.firstName}!',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold,)
              ),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/leader');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      minimumSize: Size(80, 30),
                      padding: EdgeInsets.symmetric(horizontal: 15),
                    ),
                    child: const Text('Leaderboard',
                      style:TextStyle(
                        color: Colors.white,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      GlobalData.clear;
                      Navigator.pushReplacementNamed(context, '/login');
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(50),
                ),
                child: Text(
                  'Balance: \$${GlobalData.credits}',
                  style: const TextStyle(color: Colors.white, fontSize: 18),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  addFunds();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  minimumSize: Size(80, 30),
                  padding: EdgeInsets.symmetric(horizontal: 15),
                ),
                child: Text('Add Credits',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: _buildWheelSection(),
            ),
            Expanded(
              flex: 4,
              child: _buildCurrentBetsSection(maxHeight: 400),
            ),
          ],
        ),
        SizedBox(height: 1),
        _buildBettingBoard(),
      ],
    );
  }


  Widget _buildWheelSection() {
    return Align(
      alignment: Alignment.topCenter,
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1C2333),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Roulette Wheel', style: TextStyle(color: Colors.white, fontSize: 22)),
            const SizedBox(height: 10),
            Stack(
              alignment: Alignment.topCenter,
              children: [
                RotationTransition(
                  turns: _animation,
                  child: Image.asset('assets/wheel.png', height: 250),
                ),
                const Positioned(
                  top: 0,
                  child: Icon(Icons.arrow_drop_down, color: Colors.red, size: 40),
                ),
              ],
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _controller.isAnimating ? null : _spinWheel,
              child: const Text('Spin (Good Luck!)',
                  style: const TextStyle(fontSize: 15)),
            ),

            const SizedBox(height: 8),
            Text('Winning Number: $winningNumber',
                style: const TextStyle(color: Colors.white, fontSize: 13)),
          ],
        ),
      ),
    );
  }


  Widget _buildCurrentBetsSection({required double maxHeight}) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1C2333),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Current Bets', style: TextStyle(color: Colors.white, fontSize: 22)),
          const SizedBox(height: 12),
          SizedBox(
            height: maxHeight - 60,
            child: currentBets.isEmpty
                ? const Center(child: Text('No bets yet', style: TextStyle(color: Colors.white70)))
                : ListView.builder(
              itemCount: currentBets.length,
              itemBuilder: (context, index) {
                final bet = currentBets[index];
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blueGrey.shade700,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '\$${bet['amount']} on ${bet['target']} (${bet['type']})',
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildBettingBoard() {
    final numbers = List.generate(36, (index) => index + 1);

    return Expanded(
      child: SingleChildScrollView(
        child: Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1C2333),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: chips.asMap().entries.map((entry) {
                  final index = entry.key;
                  final chip = entry.value;
                  final isSelected = selectedChipIndex == index;

                  return Flexible(
                    child: AspectRatio(
                      aspectRatio: 1,
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedChipIndex = index;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: chip['color'] as Color,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black,
                                blurRadius: 6,
                                offset: const Offset(2, 4),
                              ),
                            ],
                            border: Border.all(
                              color: isSelected ? Colors.blueAccent : Colors.white,
                              width: 3,
                            ),
                          ),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              for (int i = 0; i < 8; i++)
                                Transform.rotate(
                                  angle: (i * 45) * 3.14159 / 180,
                                  child: Align(
                                    alignment: Alignment.topCenter,
                                    child: Container(
                                      width: 6,
                                      height: 7,
                                      margin: const EdgeInsets.only(top: 3),
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              Text(
                                chip['label'] as String,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {

                    if (selectedChipIndex != null) {
                      final chipValue = chips[selectedChipIndex!]['value'];
                      setState(() {
                        currentBets.add({
                          'amount': chipValue,
                          'target': 0,
                          'type': 'straight',
                        });
                      });
                    }

                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.shade700,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Center(
                      child: Text(
                        '0',
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              Column(
                children: [
                  for (int i = 0; i < numbers.length; i += 6)
                    Row(
                      children: numbers
                          .skip(i)
                          .take(6)
                          .map((num) => Flexible(child: _buildNumberBox(num)))
                          .toList(),
                    ),
                ],
              ),

              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Flexible(child: _buildOptionBox('1-18')),
                  Flexible(child: _buildOptionBox('EVEN')),
                  Flexible(child: _buildOptionBox('RED')),
                  Flexible(child: _buildOptionBox('BLACK')),
                  Flexible(child: _buildOptionBox('ODD')),
                  Flexible(child: _buildOptionBox('19-36')),
                ],
              ),
              const SizedBox(height: 12),

              ElevatedButton(
                onPressed: () {
                  setState(() {
                    currentBets.clear();

                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  minimumSize: const Size(double.infinity, 40),
                ),
                child: const Text('Clear Bets',
                    style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  final Set<int> redNumbers = {
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
  };

  Widget _buildNumberBox(int num) {
    final color = num == 0
        ? Colors.green.shade700
        : redNumbers.contains(num)
        ? Colors.red.shade700
        : Colors.black;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {

          if (selectedChipIndex != null) {
            final chipValue = chips[selectedChipIndex!]['value'];
            setState(() {
              currentBets.add({
                'amount': chipValue,
                'target': num,
                'type': 'straight',
              });
            });
          }


        },
        borderRadius: BorderRadius.circular(6),
        child: AspectRatio(
          aspectRatio: 1,
          child: Container(
            margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: Center(
              child: Text(
                '$num',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOptionBox(String label) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {

          if (selectedChipIndex != null) {
            final chipValue = chips[selectedChipIndex!]['value'];
            setState(() {
              currentBets.add({
                'amount': chipValue,
                'target': label,
                'type': 'outside',
              });
            });
          }

        },
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 70,
          height: 40,
          margin: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.blue.shade700,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: Center(
            child: Text(
              label,
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ),
      ),
    );
  }



}
