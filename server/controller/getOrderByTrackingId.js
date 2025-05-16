const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      return res.status(400).json({ error: "trackingId is required" });
    }

    // Step 1: Find user having an order item with the trackingId
    const user = await User.findOne({
      "orders.items.trackingId": trackingId,
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with this trackingId" });
    }

    // Step 2: Find the specific order that includes this tracking ID
    const matchedOrder = user.orders.find((order) =>
      order.items.some((item) => item.trackingId === trackingId)
    );

    if (!matchedOrder) {
      return res
        .status(404)
        .json({ error: "Order not found for this trackingId" });
    }

    // Step 3: Return full user details with only the matched order
    const userObject = user.toObject();
    userObject.orders = [matchedOrder]; // Replace all orders with just the matched one

    res.status(200).json({ orders: [userObject] }); // same structure as recent orders controller
  } catch (error) {
    console.error("Error fetching order by trackingId:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
