const User = require("../models/User");

module.exports = async (req, res) => {
  const { date } = req.query; // Expecting a date in 'YYYY-MM-DD' format
  // console.log(date); // Log the date for debugging

  try {
    // Parse the date to start and end of the day
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Add one day to include the whole day

    // Find users and filter their orders based on the createdAt date
    const users = await User.find({}).populate("orders");

    // Filter users' orders that match the provided date
    const filteredUsers = users
      .map((user) => {
        // Filter orders for each user
        const filteredOrders = user.orders.filter(
          (order) => order.createdAt >= startDate && order.createdAt < endDate
        );
        return { ...user.toObject(), orders: filteredOrders }; // Return user data along with filtered orders
      })
      .filter((user) => user.orders.length > 0); // Remove users without matching orders

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error finding users:", error);
    res.status(500).json({ error: "Could not find users" });
  }
};
