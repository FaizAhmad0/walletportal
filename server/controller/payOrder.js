const User = require("../models/User");

module.exports = async (req, res) => {
  console.log("working");
  try {
    const { orderId, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const order = user.orders.id(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus) {
      return res.status(400).json({ message: "Payment already completed" });
    }
    if (user.amount < order.finalAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    user.amount -= order.finalAmount;
    user.gms += parseFloat(order.finalAmount);
    order.paymentStatus = true;

    const newTransaction = {
      amount: order.finalAmount,
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
