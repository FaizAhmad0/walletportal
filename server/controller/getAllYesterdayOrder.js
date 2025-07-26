const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    // Get start of yesterday
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    // Get end of today (or use `new Date()` to use current time)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Step 1: Find users with at least one order from yesterday or today
    const usersWithRecentOrders = await User.find({
      orders: {
        $elemMatch: {
          createdAt: {
            $gte: startOfYesterday,
            $lte: endOfToday,
          },
        },
      },
    });

    // Step 2: Filter orders to keep only those from yesterday and today
    const filteredUsers = usersWithRecentOrders.map((user) => {
      const recentOrders = user.orders.filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= startOfYesterday && createdAt <= endOfToday;
      });

      return {
        ...user.toObject(),
        orders: recentOrders,
      };
    });

    res.status(200).json({ orders: filteredUsers });
  } catch (error) {
    console.error("Error retrieving recent orders:", error);
    res.status(500).json({ error: "Could not retrieve recent orders" });
  }
};
