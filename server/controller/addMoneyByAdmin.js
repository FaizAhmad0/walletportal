const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { add } = req.params; // add or deduct
    let { clientId, amount, reason } = req.body;
    amount = amount.toString();
    const user = await User.findById(clientId);
    if (add === "add") {
      user.amount += parseFloat(amount);
      const newTransaction = {
        amount: amount,
        credit: true,
        description: reason,
      };
      user.transactions.push(newTransaction);
      await user.save();
      res.status(200).json({ message: "Money added successfully!" });
    } else {
      user.amount -= parseFloat(amount);
      const newTransaction = {
        amount: amount,
        debit: true,
        description: reason,
      };
      user.transactions.push(newTransaction);
      await user.save();
      res.status(200).json({ message: "Money deducted successfully!" });
    }
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};
