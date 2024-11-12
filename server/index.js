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
    // origin: "http://localhost:3000",
    origin: "https://wallet.saumiccraft.in",

    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true, // Enable sending of cookies and HTTP Authentication information
  })
);

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);
Instamojo.isSandboxMode(true);

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

// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const User = require("./routes/User");
// const login = require("./routes/Login");
// const Products = require("./routes/Products");
// const Order = require("./routes/Order");
// const Wallet = require("./routes/Wallet");
// const WalletAction = require("./routes/WalletAction");
// const Instamojo = require("instamojo-nodejs");

// const app = express();
// dotenv.config(); // Load environment variables

// const PORT = process.env.PORT || 5000;

// // Body parser middleware
// app.use(bodyParser.json());
// app.use(express.json()); // Parse incoming JSON requests

// // CORS configuration
// const allowedOrigins = ["http://localhost:3000", "https://wallet.saumiccraft.in"];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true, // Enable credentials (cookies, auth headers)
//   })
// );

// // Instamojo configuration
// Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
// Instamojo.isSandboxMode(process.env.NODE_ENV !== "production"); // Set to false for production

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("DB connected successfully");

//     // Start the server
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Error connecting to MongoDB:", error.message);
//   });

// // Routes
// app.use("/user", User);
// app.use("/login", login);
// app.use("/products", Products);
// app.use("/orders", Order);
// app.use("/wallet", Wallet);
// app.use("/wallet-action", WalletAction);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send({ message: "Something went wrong!" });
// });
