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

// const printUnpaidOrdersWithDate = async () => {
//   try {
//     const users = await User.find({});

//     let totalUnpaid = 0;

//     for (const user of users) {
//       for (const order of user.orders) {
//         if (!order.paymentStatus) {
//           console.log(`🔹 User: ${user.name}`);
//           console.log(`   📦 Order ID: ${order._id}`);
//           console.log(`   🗓️  Order Date: ${order.date || order.createdAt}`);
//           console.log(`   💰 Payment Status: Unpaid\n`);
//           totalUnpaid++;
//         }
//       }
//     }

//     console.log(`📢 Total unpaid orders found: ${totalUnpaid}`);
//   } catch (error) {
//     console.error("❌ Error fetching unpaid orders:", error);
//   }
// };

// printUnpaidOrdersWithDate();

const shipAllUnshippedOrdersTill25June = async () => {
  try {
    const users = await User.find({});
    let totalShipped = 0;

    const cutoffDate = new Date("2025-06-25T23:59:59.999Z");

    for (const user of users) {
      let updated = false;

      for (const order of user.orders) {
        const orderDate = new Date(order.date || order.createdAt);

        if (!order.shipped && orderDate <= cutoffDate) {
          console.log(`🔹 User: ${user.name}`);
          console.log(`   📦 Order ID: ${order._id}`);
          console.log(`   🗓️  Order Date: ${orderDate.toISOString()}`);
          console.log(
            `   🚚 Shipping Status: Not Shipped — ✅ Marking as Shipped\n`
          );

          // Update field
          order.shipped = true;
          updated = true;
          totalShipped++;
        }
      }

      if (updated) {
        await user.save();
      }
    }

    console.log(`✅ Total orders marked as shipped: ${totalShipped}`);
  } catch (error) {
    console.error("❌ Error shipping orders:", error);
  }
};

// shipAllUnshippedOrdersTill25June();




const updateProductActionForAmazonOrderId = async () => {
  try {
    const enrollmentId = "AZ2471";
    const targetAmazonOrderId = "171-5191587-8182727";

    // Find the user by enrollment ID
    const user = await User.findOne({ enrollment: enrollmentId });

    if (!user) {
      console.log(`❌ User with enrollment "${enrollmentId}" not found.`);
      return;
    }

    let itemFound = false;

    // Loop through all orders
    for (const order of user.orders) {
      // Loop through all items in each order
      for (const item of order.items) {
        if (item.amazonOrderId === targetAmazonOrderId) {
          item.productAction = "Available";
          itemFound = true;

          console.log(
            `✅ Found item with Amazon Order ID: ${item.amazonOrderId}`
          );
          console.log(`🔁 Updated productAction to "Available"\n`);

          break; // Remove this if you want to update all matches
        }
      }

      if (itemFound) break;
    }

    if (itemFound) {
      await user.save();
      console.log("✅ Changes saved successfully.");
    } else {
      console.log(
        `❌ No matching item with Amazon Order ID: ${targetAmazonOrderId}`
      );
    }
  } catch (err) {
    console.error("❌ Error updating productAction:", err);
  }
};

// updateProductActionForAmazonOrderId();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
