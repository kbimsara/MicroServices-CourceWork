const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Order" },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
