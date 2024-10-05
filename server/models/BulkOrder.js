const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Payment schema
const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    stage: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Bulk order schema
const bulkOrderSchema = new Schema(
  {
    orderId: {
      type: Number,
    },
    enrollment: {
      type: String,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    partyName: {
      type: String,
      required: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStage: [paymentSchema], // Array of payment stages
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Add auto-increment for orderId
const AutoIncrement = require("mongoose-sequence")(mongoose);
bulkOrderSchema.plugin(AutoIncrement, {
  inc_field: "orderId",
  id: "orderCounter",
  start_seq: 1,
});

// Pre-save hook to auto-increment the `stage` for each payment stage within an order
bulkOrderSchema.pre("save", function (next) {
  const order = this;

  // Loop through the paymentStage array and assign incremented `stage` values
  order.paymentStage.forEach((payment, index) => {
    if (!payment.stage) {
      payment.stage = index + 1; // Start stage at 1, increment for each subsequent stage
    }
  });

  next();
});

const BulkOrder = model("BulkOrder", bulkOrderSchema);
module.exports = BulkOrder;
