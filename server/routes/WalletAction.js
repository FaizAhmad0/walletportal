const express = require("express");
const addMoneyByAdmin = require("../controller/addMoneyByAdmin");
const router = express.Router();

router.post("/:add",addMoneyByAdmin)

module.exports = router;
