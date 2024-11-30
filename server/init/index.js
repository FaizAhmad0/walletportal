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
const saveAllUsers = async () => {
  try {
    // Find products with the specified GST rate
    const products = await Product.find({ gstRate: 0.18 });
    const length = products.length;
    console.log(`Number of products to update: ${length}`);

    // Update GST rate for each product individually
    for (const product of products) {
      product.gstRate = 18; // Update GST rate
      await product.save(); // Save the updated product
    }

    console.log("All products updated successfully.");
  } catch (error) {
    console.error("Error updating products:", error);
  }
};

saveAllUsers();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
