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
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // 1 month ago

    // Step 1: Find users with at least one order in the last 1 month
    const usersWithRecentOrders = await User.find({
      orders: {
        $elemMatch: {
          createdAt: { $gte: oneMonthAgo },
        },
      },
    });

    // Step 2: Filter orders to keep only those from the last 1 month
    const filteredUsers = usersWithRecentOrders.map((user) => {
      const recentOrders = user.orders.filter((order) => {
        return new Date(order.createdAt) >= oneMonthAgo;
      });

      return {
        ...user.toObject(),
        orders: recentOrders,
      };
    });

    console.log(filteredUsers);
    res.status(200).json({ orders: filteredUsers });
  } catch (error) {
    console.error("Error retrieving recent orders:", error);
    res.status(500).json({ error: "Could not retrieve recent orders" });
  }
};
