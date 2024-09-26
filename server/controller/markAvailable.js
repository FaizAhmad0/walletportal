const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const itemId = req.params.id;
    const user = await User.findOne({
      "orders.items._id": itemId,
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Item not found in any user's orders" });
    }

    let foundItem = null;
    let foundOrder = null;
    user.orders.forEach((order) => {
      const item = order.items.find((i) => i._id.toString() === itemId);
      if (item) {
        foundItem = item;
        foundOrder = order;
      }
    });

    if (foundItem) {
      foundItem.productAction = "Available";
      await user.save();

      return res.status(200).json({
        message: "Item found and updated",
        item: foundItem,
        order: foundOrder,
        user,
      });
    }

    res.status(404).json({ message: "Item not found" });
  } catch (error) {
    console.error("Error fetching or updating item:", error);
    res.status(500).json({ error: "Server error" });
  }
};
