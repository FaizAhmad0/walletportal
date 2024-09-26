const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./routes/User");
const login = require("./routes/Login");
const Products = require("./routes/Products");
const Order = require("./routes/Order");
const Wallet = require("./routes/Wallet");
const WalletAction = require("./routes/WalletAction");
const Instamojo = require("instamojo-nodejs");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Enable sending of cookies and HTTP Authentication information
  })
);

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);
Instamojo.isSandboxMode(true); // Change to false for production

app.use(express.json());
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("DB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

app.use("/user", User);
app.use("/login", login);
app.use("/products", Products);
app.use("/orders", Order);
app.use("/wallet", Wallet);
app.use("/wallet-action", WalletAction);
