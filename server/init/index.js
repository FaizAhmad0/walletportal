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
    const products = await Product.find({
      name: "Digital wall painting",
    }); // Clear the collection before inserting
    console.log(products);
  } catch (error) {
    console.error("Error saving users:", error);
  }
};

saveAllUsers();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
