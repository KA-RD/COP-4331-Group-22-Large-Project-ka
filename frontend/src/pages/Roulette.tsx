useEffect(() => {
  const fetchBalance = async () => {
    try {
      // Get the JWT the same way you do in addcredits
      const jwtToken = window.jwtToken; // <- the global variable your frontend sets
      if (!jwtToken) return;

      const res = await fetch("http://167.172.30.196/api/getbalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwtToken }), // POST body contains { jwtToken }
      });

      if (!res.ok) return;

      const data = await res.json();
      setBalance(data.credits); // now balance should display
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  fetchBalance();
}, []);
