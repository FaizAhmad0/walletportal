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

// const updateFinalAmountByOrderId = async (orderIdToFind, newFinalAmount) => {
//   try {
//     const user = await User.findOne({
//       "orders.orderId": parseInt(orderIdToFind),
//     });

//     if (!user) {
//       console.log("❌ No user found with that orderId.");
//       return;
//     }

//     const order = user.orders.find(
//       (o) => o.orderId === parseInt(orderIdToFind)
//     );

//     if (!order) {
//       console.log("❌ Order not found in user document.");
//       return;
//     }

//     order.finalAmount = newFinalAmount;

//     await user.save(); // Save updated document

//     console.log(
//       `✅ Updated order ${orderIdToFind} finalAmount to ₹${newFinalAmount}`
//     );
//   } catch (err) {
//     console.error("❌ Error updating finalAmount:", err);
//   }
// };

// Call the function like this:
// updateFinalAmountByOrderId(19145, "5667.9");

const retainOnlyJuneAndJulyOrders = async () => {
  try {
    const users = await User.find({});
    let totalDeleted = 0;
    let totalRetained = 0;

    const startOfJune = new Date("2025-07-01T00:00:00.000Z");
    const endOfJuly = new Date("2025-07-25T23:59:59.999Z");

    for (const user of users) {
      const originalOrderCount = user.orders.length;

      // Keep only orders in June or July
      const filteredOrders = user.orders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate >= startOfJune && orderDate <= endOfJuly;
      });

      const deletedCount = originalOrderCount - filteredOrders.length;
      if (deletedCount > 0) {
        console.log(`🗑️ Deleted ${deletedCount} orders for user: ${user.name}`);
        totalDeleted += deletedCount;
      }

      totalRetained += filteredOrders.length;
      user.orders = filteredOrders;
      await user.save();
    }

    console.log(`✅ Deleted orders not in June or July: ${totalDeleted}`);
    console.log(
      `📦 Total orders retained (June & July only): ${totalRetained}`
    );
  } catch (error) {
    console.error("❌ Error while deleting old orders:", error);
  }
};

retainOnlyJuneAndJulyOrders();

// const shipAllUnshippedOrdersTill25June = async () => {
//   try {
//     const users = await User.find({});
//     let totalShipped = 0;

//     const cutoffDate = new Date("2025-06-25T23:59:59.999Z");

//     for (const user of users) {
//       let updated = false;

//       for (const order of user.orders) {
//         const orderDate = new Date(order.date || order.createdAt);

//         if (!order.shipped && orderDate <= cutoffDate) {
//           console.log(`🔹 User: ${user.name}`);
//           console.log(`   📦 Order ID: ${order._id}`);
//           console.log(`   🗓️  Order Date: ${orderDate.toISOString()}`);
//           console.log(
//             `   🚚 Shipping Status: Not Shipped — ✅ Marking as Shipped\n`
//           );

//           // Update field
//           order.shipped = true;
//           updated = true;
//           totalShipped++;
//         }
//       }

//       if (updated) {
//         await user.save();
//       }
//     }

//     console.log(`✅ Total orders marked as shipped: ${totalShipped}`);
//   } catch (error) {
//     console.error("❌ Error shipping orders:", error);
//   }
// };

// shipAllUnshippedOrdersTill25June();

// const updateProductActionForAmazonOrderId = async () => {
//   try {
//     const enrollmentId = "AZ2471";
//     const targetAmazonOrderId = "171-5191587-8182727";

//     // Find the user by enrollment ID
//     const user = await User.findOne({ enrollment: enrollmentId });

//     if (!user) {
//       console.log(`❌ User with enrollment "${enrollmentId}" not found.`);
//       return;
//     }

//     let itemFound = false;

//     // Loop through all orders
//     for (const order of user.orders) {
//       // Loop through all items in each order
//       for (const item of order.items) {
//         if (item.amazonOrderId === targetAmazonOrderId) {
//           item.productAction = "Available";
//           itemFound = true;

//           console.log(
//             `✅ Found item with Amazon Order ID: ${item.amazonOrderId}`
//           );
//           console.log(`🔁 Updated productAction to "Available"\n`);

//           break; // Remove this if you want to update all matches
//         }
//       }

//       if (itemFound) break;
//     }

//     if (itemFound) {
//       await user.save();
//       console.log("✅ Changes saved successfully.");
//     } else {
//       console.log(
//         `❌ No matching item with Amazon Order ID: ${targetAmazonOrderId}`
//       );
//     }
//   } catch (err) {
//     console.error("❌ Error updating productAction:", err);
//   }
// };

// updateProductActionForAmazonOrderId();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
