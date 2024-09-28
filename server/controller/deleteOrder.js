const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(orderId);
    const user = await User.findOneAndUpdate(
      { "orders._id": orderId },
      { $pull: { orders: { _id: orderId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User or order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Could not delete order" });
  }
};
