const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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
    manager: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      required: true,
    },
    sku: [
      {
        sku: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        totalPayment: {
          type: Number,
        },
        whereReceived: {
          type: String,
        },
        paymentDate: {
          type: String,
        },
      },
    ],

    fnsku: {
      type: String,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    pickupDate: {
      type: Date,
    },
    boxLabel: {
      type: String,
    },
    remark: {
      type: String,
      required: true,
    },
    stockStatus: {
      type: String,
    },
    stockStatus: {
      type: String,
    },
    shippingCompany: {
      type: String,
    },
    stockReadyDate: {
      type: Date,
    },
    shippingAddress: {
      type: String,
    },
    shippingType: {
      type: String,
    },
    trackingId: {
      type: String,
    },
    shipped: {
      type: Boolean,
      default: false,
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

const BulkOrder = model("BulkOrder", bulkOrderSchema);
module.exports = BulkOrder;
