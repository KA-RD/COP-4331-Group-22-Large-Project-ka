// roulette.js

module.exports = function(app) {
  const numbers = Array.from({ length: 37 }, (_, i) => i); // 0 to 36

  // Red numbers on the wheel
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  // Function to randomly pick a number
  function spinWheel() {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
  }

  // Function to determine color
  function getColor(num) {
    if (num === 0) return "green";
    return redNumbers.has(num) ? "red" : "black";
  }

  // Evaluate bets and calculate payout
  function evaluateBets(bets, result) {
    let payout = 0;
    const color = getColor(result);
    const isEven = result !== 0 && result % 2 === 0;

    for (const bet of bets) {
      const { type, value, amount } = bet;

      switch (type) {
        case "straight":
          if (result === value) payout += amount * 35;
          break;
        case "color":
          if (value === color) payout += amount * 2;
          break;
        case "evenOdd":
          if (result !== 0) {
            if (value === "even" && isEven) payout += amount * 2;
            if (value === "odd" && !isEven) payout += amount * 2;
          }
          break;
        case "range":
          const [min, max] = value.split("-").map(n => parseInt(n));
          if (result >= min && result <= max) payout += amount * 2;
          break;
      }
    }

    return payout;
  }

  // POST /roulette/spin
  app.post("/roulette/spin", async (req, res) => {
    
    console.log("Received /roulette/spin request", req.body);
    
    const bets = req.body.bets || [];
    const jwtToken = req.body.jwtToken; // JWT from frontend
    
    console.log("Bets:", bets, "JWT:", jwtToken);

    const result = spinWheel();

     console.log("Wheel spun:", result);
    
    const color = getColor(result);
    const isEven = result !== 0 && result % 2 === 0;

    const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);
    const payout = evaluateBets(bets, result);
    
      console.log("Calculated payout:", payout);
    
    const profit = payout - totalBet;

     console.log("Profit:", profit);

    // --- RETURN SPIN RESULT ---
    res.json({
      result,
      color,
      isEven,
      payout,
      profit
    });
  });
};



