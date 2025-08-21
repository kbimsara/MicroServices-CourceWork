const Shipping = require("../models/shipping.model");
const mongoose = require("mongoose");
const { publish } = require("../utils/rabbitmq");

// Create Shipping Record
exports.createShipping = async (req, res) => {
  const { orderId, userId, address } = req.body;
  if (!orderId || !userId || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const shipping = new Shipping({ orderId, userId, address });
    await shipping.save();

    await publish("shipping.created", shipping);

    res.status(201).location(`/shipments/${shipping._id}`).json(shipping);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Shipping Records (filter by status + pagination)
exports.getShipments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const { status } = req.query;

    const filter = status ? { status } : {};
    const [shipments, total] = await Promise.all([
      Shipping.find(filter).skip((page - 1) * limit).limit(limit),
      Shipping.countDocuments(filter),
    ]);

    res.json({ page, limit, total, data: shipments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Shipping Status
exports.updateStatus = async (req, res) => {
  const { shipmentId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "shipped", "delivered", "cancelled"];

  if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
    return res.status(400).json({ error: "Invalid Shipment ID" });
  }
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const existing = await Shipping.findById(shipmentId);
    if (!existing) return res.status(404).json({ error: "Shipment not found" });

    const previousStatus = existing.status;
    existing.status = status;
    const updated = await existing.save();

    await publish("shipping.statusUpdated", { shipmentId, previousStatus, status });

    res.json({
      shipmentId,
      previousStatus,
      newStatus: status,
      updatedAt: updated.updatedAt || updated.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Shipping Record
exports.deleteShipment = async (req, res) => {
  const { shipmentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
    return res.status(400).json({ error: "Invalid Shipment ID" });
  }

  try {
    const shipping = await Shipping.findByIdAndDelete(shipmentId);
    if (!shipping) return res.status(404).json({ error: "Shipment not found" });
    res.json({ message: "Shipment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
