const Product = require("../models/Product");

module.exports = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: "New product created successfully", newProduct });
  } catch (error) {
    console.error("Error creating new product:", error);
    res.status(500).json({ error: "Could not create new product" });
  }
};
