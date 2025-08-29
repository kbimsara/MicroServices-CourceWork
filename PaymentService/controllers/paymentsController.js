const Payment = require("../models/payment.model");
const mongoose = require("mongoose");
const { publish } = require("../utils/rabbitmq");

// Create Payment
exports.createPayment = async (req, res) => {
  const { orderId, userId, amount, method } = req.body;
  if (!orderId || !userId || !amount || !method) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const payment = new Payment({ orderId, userId, amount, method });
    await payment.save();

    // Publish event
    await publish("payment.created", payment);

    res.status(201).location(`/payments/${payment._id}`).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Payments with optional filtering
exports.getPayments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const { status } = req.query;

    const filter = status ? { status } : {};
    const [payments, total] = await Promise.all([
      Payment.find(filter).skip((page - 1) * limit).limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.json({ page, limit, total, data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Payment by ID
exports.getPaymentById = async (req, res) => {
  const { paymentId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ error: "Invalid Payment ID" });
  }

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Payment by Order ID
exports.getPaymentByOrderId = async (req, res) => {
  const { orderId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID" });
  }

  try {
    const payment = await Payment.findOne({ orderId: orderId });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found for this order" });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Payment Status
exports.updateStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "completed", "failed"];

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ error: "Invalid Payment ID" });
  }
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const existing = await Payment.findById(paymentId);
    if (!existing) return res.status(404).json({ error: "Payment not found" });

    const previousStatus = existing.status;
    existing.status = status;
    const updated = await existing.save();

    await publish("payment.statusUpdated", { paymentId, previousStatus, status });

    res.json({
      paymentId,
      previousStatus,
      newStatus: status,
      updatedAt: updated.updatedAt || updated.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  const { paymentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ error: "Invalid Payment ID" });
  }

  try {
    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
