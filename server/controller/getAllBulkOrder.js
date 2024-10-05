const BulkOrder = require("../models/BulkOrder");
module.exports = async (req, res) => {
  try {
    const orders = await BulkOrder.find();
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};
