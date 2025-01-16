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

// Save all users from data.js to the database
// const saveAllUsers = async () => {
//   try {
//     // Find products with the specified GST rate
//     const products = await Product.find({ gstRate: 0.18 });
//     const length = products.length;
//     console.log(`Number of products to update: ${length}`);

//     // Update GST rate for each product individually
//     for (const product of products) {
//       product.gstRate = 18; // Update GST rate
//       await product.save(); // Save the updated product
//     }

//     console.log("All products updated successfully.");
//   } catch (error) {
//     console.error("Error updating products:", error);
//   }
// };

// saveAllUsers();
// const fetchOrdersWithInvalidGST = async () => {
//   try {
//     // Fetch orders that have at least one item with gstRate not in [18, 12]
//     const orders = await User.aggregate([
//       {
//         $unwind: "$orders", // Unwind orders array to work with each order individually
//       },
//       {
//         $unwind: "$orders.items", // Unwind items array to work with each item individually
//       },
//       {
//         $match: {
//           "orders.items.gstRate": { $nin: [18, 12] }, // Match items with gstRate not in [18, 12]
//         },
//       },
//       {
//         $project: {
//           orderId: "$orders.orderId", // Include orderId
//           items: "$orders.items", // Include only the items of the order
//           finalAmount: "$orders.finalAmount", // Include finalAmount
//           paymentStatus: "$orders.paymentStatus", // Include paymentStatus
//           name: 1, // Include user name
//           email: 1, // Include user email
//           enrollment: 1, // Include user enrollment
//           createdAt: "$orders.createdAt", // Include order's createdAt timestamp
//           userCreatedAt: "$createdAt", // Include user's createdAt timestamp
//         },
//       },
//     ]);

//     console.log(
//       "Orders with invalid GST rates and createdAt:",
//       JSON.stringify(orders, null, 2)
//     );
//     console.log("Total orders with wrong GST rate:", orders.length);
//   } catch (error) {
//     console.error("Error fetching orders with invalid GST:", error);
//   }
// };

// // Call the function to fetch the data
// fetchOrdersWithInvalidGST();

const fetchByEnrollment = async (id) => {
  try {
    const users = await User.find({ enrollment: id });

    if (users.length > 0) {
      users.forEach((user) => {
        if (Array.isArray(user.transactions)) {
          // Filter transactions with credit: true and calculate their sum
          const creditedTotal = user.transactions
            .filter((transaction) => transaction.debit) // Filter only credited transactions
            .reduce((sum, transaction) => {
              const amount = parseFloat(transaction.amount); // Convert amount to a number
              return sum + (isNaN(amount) ? 0 : amount); // Add amount if it's valid
            }, 0);

          console.log(
            `Total Credited Amount for User ${user.name}: ${creditedTotal}`
          );
        } else {
          console.log("No transactions found for this user.");
        }
      });
    } else {
      console.log("User not found.");
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

fetchByEnrollment("AZ1797");
// const fetchOrderByAmazonOrderId = async (amazonOrderId) => {
//   try {
//     const order = await User.aggregate([
//       { $unwind: "$orders" },
//       { $unwind: "$orders.items" },
//       {
//         $match: {
//           "orders.items.amazonOrderId": amazonOrderId,
//         },
//       },
//       {
//         $project: {
//           _id: 0, // Exclude internal MongoDB ID
//           name: 1, // Include user details
//           email: 1,
//           enrollment: 1,
//           userCreatedAt: "$createdAt",
//           order: {
//             orderId: "$orders.orderId",
//             items: "$orders.items",
//             finalAmount: "$orders.finalAmount",
//             paymentStatus: "$orders.paymentStatus",
//             createdAt: "$orders.createdAt",
//           },
//         },
//       },
//     ]);

//     if (order.length > 0) {
//       console.log(
//         "Order with Amazon Order ID:",
//         JSON.stringify(order[0], null, 2)
//       );
//     } else {
//       console.log("No order found with the specified Amazon Order ID.");
//     }
//   } catch (error) {
//     console.error("Error fetching order by Amazon Order ID:", error);
//   }
// };

// // Call the function
// fetchOrderByAmazonOrderId("408-8170367-7810747");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
