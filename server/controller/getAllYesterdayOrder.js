const User = require("../models/User");
module.exports = async (req, res) => {
  try {
    // Get start and end of yesterday
    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(now);
    endOfYesterday.setDate(now.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Step 1: Find users with at least one order from yesterday
    const usersWithYesterdayOrders = await User.find({
      orders: {
        $elemMatch: {
          createdAt: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
        },
      },
    });

    // Step 2: Filter orders to keep only those from yesterday
    const filteredUsers = usersWithYesterdayOrders.map((user) => {
      const yesterdayOrders = user.orders.filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= startOfYesterday && createdAt <= endOfYesterday;
      });

      return {
        ...user.toObject(),
        orders: yesterdayOrders,
      };
    });

    res.status(200).json({ orders: filteredUsers });
  } catch (error) {
    console.error("Error retrieving yesterday's orders:", error);
    res.status(500).json({ error: "Could not retrieve yesterday's orders" });
  }
};
