const Product = require("../models/Product");

module.exports = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(201).json({ products });
  } catch (error) {
    console.error("Error finding all  product:", error);
    res.status(500).json({ error: "Could not find all product" });
  }
};
