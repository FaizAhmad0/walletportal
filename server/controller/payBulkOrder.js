const BulkOrder = require("../models/BulkOrder");
const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { orderId, amount, enrollment } = req.body;
    console.log(enrollment);

    // Fetch the user by enrollment
    const user = await User.findOne({ enrollment: enrollment });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Deduct amount
    user.amount -= amount;

    // Initialize transactions if undefined
    if (!Array.isArray(user.transactions)) {
      user.transactions = [];
    }

    // Create a new transaction
    const newTransaction = {
      amount: amount,
      debit: true,
      description: "Deduct amount while paying bulk-order!",
    };

    // Add transaction to user
    user.transactions.push(newTransaction);
    await user.save();

    // Find the bulk order by orderId
    const order = await BulkOrder.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Initialize paymentStage if not an array
    if (!Array.isArray(order.paymentStage)) {
      order.paymentStage = [];
    }

    // Add payment amount to paymentStage
    const amountString = amount.toString(); // Ensure amount is a string
    order.paymentStage.push({ amount: amountString });

    // Save the updated order
    const updatedOrder = await order.save();

    // Respond with success
    res.status(200).json({ message: "Payment done", orderId });
  } catch (error) {
    console.error("Error during payment:", error); // Log the full error
    res.status(500).json({ error: "Server error during payment!" });
  }
};
