// index.js
const express = require("express");
const mongoose = require("mongoose");
const sampleData = require("./data"); // Import the data
const User = require("../models/User"); // Import the Mongoose model

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
    await User.deleteMany({}); // Clear the collection before inserting
    await User.insertMany(sampleData);
    console.log("All users saved to the database");
  } catch (error) {
    console.error("Error saving users:", error);
  }
};
saveAllUsers();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
