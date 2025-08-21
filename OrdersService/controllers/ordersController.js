const Order = require("../models/order.model");
const mongoose = require("mongoose");
const { publish } = require("../utils/rabbitmq");

// Create Order
exports.createOrder = async (req, res) => {
  const { userId, productId, amount, quantity } = req.body;
  if (!userId || !productId || !amount || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const order = new Order({ userId, productId, amount, quantity });
    await order.save();

    // Publish event
    await publish("order.created", order);

    res.status(201).location(`/orders/${order._id}`).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Orders (with optional filtering + pagination)
exports.getOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const { status } = req.query;

    const filter = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Order Status (returns previous + new)
exports.updateStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "completed", "cancelled"];

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID" });
  }
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const existing = await Order.findById(orderId);
    if (!existing) return res.status(404).json({ error: "Order not found" });

    const previousStatus = existing.status;
    existing.status = status;
    const updated = await existing.save();

    // Publish event
    await publish("order.statusUpdated", { orderId, previousStatus, status });

    res.json({ orderId, previousStatus, newStatus: status, updatedAt: updated.updatedAt || updated.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID" });
  }

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
