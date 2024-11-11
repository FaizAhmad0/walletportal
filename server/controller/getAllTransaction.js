const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const users = await User.find({}, "transactions");
    const allTransactions = users.reduce((acc, user) => {
      return acc.concat(user.transactions);
    }, []);
    res.status(200).json({ transactions: allTransactions });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ error: "Could not retrieve transactions" });
  }
};
