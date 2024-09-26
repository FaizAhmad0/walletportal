const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOne({ enrollment: enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { items, finalAmount } = req.body;
    const flattenedItems = items.flat();
    user.amount -= finalAmount;
    user.gms += parseFloat(finalAmount);
    const newTransaction = {
      amount: finalAmount,
      debit: true,
      description: "Deduct amount while purchasing the product!",
    };

    user.transactions.push(newTransaction);

    const newOrder = {
      items: flattenedItems,
      finalAmount: finalAmount,
      paymentStatus: true,
    };
    user.orders.push(newOrder);
    await user.save();
    res.status(200).json({ message: "order created successfully" });
  } catch (error) {
    console.error("Error saving order to orders:", error);
    res.status(500).json({ error: "Could not save order to orders" });
  }
};
