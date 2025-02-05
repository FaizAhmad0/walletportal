const BulkOrder = require("../models/BulkOrder");
module.exports = async (req, res) => {
  try {
    const { manager } = req.params;
    // console.log(manager);
    let orders;
    if (manager === "Dispatch") {
      orders = await BulkOrder.find({});
    } else {
      orders = await BulkOrder.find({ manager: manager });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};
