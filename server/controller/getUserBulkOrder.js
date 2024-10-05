const BulkOrder = require("../models/BulkOrder");
module.exports = async (req, res) => {
  try {
    const { user } = req.params;
    // console.log(user);
    // console.log(manager);
    const orders = await BulkOrder.find({ enrollment: user });
    // console.log(orders);
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};
