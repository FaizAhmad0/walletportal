const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const transactionSchema = new Schema(
  {
    amount: {
      type: String,
      required: true,
    },
    credit: {
      type: Boolean,
      default: false,
    },
    debit: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      // required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const itemSchema = new Schema({
  sku: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
  },
  gstRate: {
    type: Number,
    required: true,
  },
  shippingPrice: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  amazonOrderId: {
    unique: true,
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  shippingPartner: {
    type: String,
    required: true,
  },
  trackingId: {
    type: String,
    required: true,
  },
  productAction: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    items: [itemSchema],
    finalAmount: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },

    orderId: {
      type: Number,
    },
    archive: {
      type: Boolean,
      default: false,
    },
    shipped: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, { inc_field: "orderId", start_seq: 1 });

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    orders: [orderSchema],
    transactions: [transactionSchema],
    enrollment: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    gst: {
      type: String,
      default: null,
    },
    mobile: {
      type: Number,
      required: true,
    },
    manager: {
      type: String,
    },
    gms: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    pincode: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "user",
        "manager",
        "dispatch",
        "shippingmanager",
        "supervisor",
        "admin",
        "accountant",
      ],
      required: true,
      default: "user",
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
module.exports = User;
