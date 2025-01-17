const express = require("express");
const router = express.Router();
const verifyOtp = require("../controller/verifyOtp");
router.post("/", verifyOtp);

module.exports = router;
