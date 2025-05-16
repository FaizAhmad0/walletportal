// index.js
const express = require("express");
const mongoose = require("mongoose");
const sampleData = require("./data"); // Import the data
const User = require("../models/User"); // Import the Mongoose model
const Product = require("../models/Product");

const app = express();
const PORT = 7500;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://saumic:saumic-wallet@wallet.zghhq.mongodb.net/?retryWrites=true&w=majority&appName=wallet",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// const deleteOldOrders = async () => {
//   try {
//     const threeMonthsAgo = new Date();
//     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

//     // Step 1: Find users who have any orders (optional optimization)
//     const users = await User.find({ "orders.0": { $exists: true } });

//     let totalDeletedOrders = 0;

//     // Step 2: Iterate users and delete old orders
//     for (const user of users) {
//       const originalOrderCount = user.orders.length;

//       // Keep only recent orders
//       user.orders = user.orders.filter((order) => {
//         const orderDate = new Date(order.createdAt);
//         return orderDate >= threeMonthsAgo;
//       });

//       const deletedCount = originalOrderCount - user.orders.length;
//       if (deletedCount > 0) {
//         await user.save();
//         totalDeletedOrders += deletedCount;
//         console.log(
//           `🗑️ Deleted ${deletedCount} old orders for ${user.name} (${user.email})`
//         );
//       }
//     }

//     console.log(
//       `✅ Total old orders deleted across all users: ${totalDeletedOrders}`
//     );
//   } catch (error) {
//     console.error("❌ Error deleting old orders:", error);
//   }
// };

// deleteOldOrders();
const markOrdersShippedByTrackingIds = async (trackingIds) => {
  try {
    const users = await User.find({
      "orders.items.trackingId": { $in: trackingIds },
    });

    let updatedOrdersCount = 0;

    for (const user of users) {
      let updated = false;

      for (const order of user.orders) {
        const hasMatchingTrackingId = order.items.some((item) =>
          trackingIds.includes(item.trackingId)
        );

        if (hasMatchingTrackingId && !order.shipped) {
          order.shipped = true;
          updated = true;
          updatedOrdersCount++;
        }
      }

      if (updated) {
        await user.save();
        console.log(`✅ Updated orders for user: ${user.name}`);
      }
    }

    console.log(`🚚 Total orders marked as shipped: ${updatedOrdersCount}`);
  } catch (error) {
    console.error("❌ Error updating orders by trackingId:", error);
  }
};

// Example usage:
const trackingIds = [
  "246000102250",
  "246000102239",
  "246000102273",
  "246000102278",
  "246000102234",
  "246000102238",
  "246000102272",
  "246000102213",
  "246000102214",
  "246000102233",
  "246000102241",
  "246000102275",
  "246000102263",
  "246000102271",
  "246000102277",
  "246000102269",
  "246000102240",
  "246000102267",
  "246000102247",
  "246000102236",
  "246000102235",
  "246000102248",
  "W61768098",
  "W61768135",
  "W61768101",
  "W61767969",
  "W61767983",
  "W61767956",
  "W61768126",
  "W61768113",
  "W61767994",
  "W61768099",
  "W61767992",
  "W61767990",
  "W61768128",
  "W61768088",
  "W61767967",
  "W61767984",
  "W61767975",
  "W61767965",
  "W61767963",
  "W61767957",
  "W61768131",
  "W61767960",
  "D2001866768",
  "W61767972",
  "W61767964",
  "W61768090",
  "W61767971",
  "W61767968",
  "W61767977",
  "W61767995",
  "W61767961",
  "W61767988",
  "W61767991",
  "W61767966",
  "W61768134",
  "W61768089",
  "W61767962",
  "W61767979",
  "W61768133",
  "W61768137",
  "W61767982",
  "W61767996",
  "W61767993",
  "W61767976",
  "W61768132",
  "W61768136",
  "W61768091",
  "W61767997",
  "W61767970",
  "W61767958",
  "W61767959",
  "W61767978",
  "W61767989",
  "W61768159",
  "W61768130",
  "W61767980",
  "W61768142",
  "W61767981",
  "W61767974",
];

markOrdersShippedByTrackingIds(trackingIds);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
