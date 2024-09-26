const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bulkOrderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    enrollment: {
      type: String,
      required: true,
    },
    amazonOrderId: {
      type: String,
      required: true,
    },
    manager: {
      type: String,
      required: true,
    },
    deliveryPartner: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: Number,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

bulkOrderSchema.plugin(AutoIncrement, {
  inc_field: "paymentStatus",
  start_seq: 1,
});

const BulkOrder = model("BulkOrder", bulkOrderSchema);
module.exports = BulkOrder;
