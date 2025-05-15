// const User = require("../models/User");

// module.exports = async (req, res) => {
//   try {
//     const threeMonthsAgo = new Date();
//     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 1);

//     // Step 1: Find users with at least one order in the last 3 months
//     const usersWithRecentOrders = await User.find({
//       orders: {
//         $elemMatch: {
//           createdAt: { $gte: threeMonthsAgo },
//         },
//       },
//     });

//     // Step 2: Filter orders to keep only those from the last 3 months
//     const filteredUsers = usersWithRecentOrders.map((user) => {
//       const recentOrders = user.orders.filter((order) => {
//         return new Date(order.createdAt) >= threeMonthsAgo;
//       });

//       return {
//         ...user.toObject(),
//         orders: recentOrders,
//       };
//     });

//     console.log(filteredUsers);
//     res.status(200).json({ orders: filteredUsers });
//   } catch (error) {
//     console.error("Error retrieving recent orders:", error);
//     res.status(500).json({ error: "Could not retrieve recent orders" });
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

    res.status(200).json({ orders: filteredUsers });
  } catch (error) {
    console.error("Error retrieving recent orders:", error);
    res.status(500).json({ error: "Could not retrieve recent orders" });
  }
};
