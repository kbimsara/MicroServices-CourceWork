const mongoose = require("mongoose");

const ShippingSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Order" },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipping", ShippingSchema);
