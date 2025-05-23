const User = require("../models/User");

module.exports = async (req, res) => {
  console.log("working");
  try {
    // Fetch users with at least one archived order
    const usersWithArchivedOrders = await User.find({
      "orders.shipped": true,
    });

    // Filter to only include archived orders
    const filteredUsers = usersWithArchivedOrders.map((user) => {
      const filteredOrders = user.orders.filter(
        (order) => order.shipped === true
      );

      return {
        ...user.toObject(), // Convert Mongoose object to plain JavaScript object
        orders: filteredOrders, // Replace the orders with the filtered ones
      };
    });
    // console.log(filteredUsers);

    res.status(201).json({ orders: filteredUsers });
  } catch (error) {
    console.error("Error finding archived orders:", error);
    res.status(500).json({ error: "Could not retrieve archived orders" });
  }
};
