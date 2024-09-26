const express = require("express");
const router = express.Router();
const createProduct = require("../controller/createProduct");
const getAllProduct = require("../controller/getAllProduct");
const updateProduct = require("../controller/updateProduct");
const bulkAddProduct = require("../controller/bulkAddProduct");
router.post("/add", createProduct);
router.get("/getall", getAllProduct);
router.put("/update/:productId", updateProduct);
router.post("/bulkAdd",bulkAddProduct);

module.exports = router;
