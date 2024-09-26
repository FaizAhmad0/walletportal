const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { amount } = req.params;
    const { enrollment, id } = req.body;
    const user = await User.findOne({ enrollment });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const order = user.orders.id(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus) {
      return res.status(400).json({ message: "Payment already completed" });
    }
    if (user.amount < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient user account balance" });
    }

    user.amount -= amount;
    user.gms += parseFloat(amount);
    order.paymentStatus = true;
    const newTransaction = {
      amount: amount,
      debit: true,
      description: "Deduct amount while purchasing the product!",
    };
    user.transactions.push(newTransaction);
    await user.save();
    res.status(200).json({ message: "Payment completed successfully!" });
  } catch (error) {
    console.error("Error in completing payment:", error);
    res.status(500).json({ message: "Error in completing payment" });
  }
};
