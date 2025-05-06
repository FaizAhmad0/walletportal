// const User = require("../models/User");

// module.exports = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const orders = await User.find({}).skip(skip).limit(limit).lean(); // lean() makes fetching lighter and faster

//     const total = await User.countDocuments();

//     res.status(200).json({
//       orders, // array of users
//       total, // total users in database
//       currentPage: page, // current page number
//       totalPages: Math.ceil(total / limit), // total pages
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Could not fetch orders" });
//   }
// };

const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Step 1: Find users with at least one order in the last 3 months
    const usersWithRecentOrders = await User.find({
      orders: {
        $elemMatch: {
          createdAt: { $gte: threeMonthsAgo },
        },
      },
    });

    // Step 2: Filter orders to keep only those from the last 3 months
    const filteredUsers = usersWithRecentOrders.map((user) => {
      const recentOrders = user.orders.filter((order) => {
        return new Date(order.createdAt) >= threeMonthsAgo;
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

