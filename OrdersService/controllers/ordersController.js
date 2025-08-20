const Order = require('../models/order.model');
const mongoose = require('mongoose');
const { publish } = require('../utils/rabbitmq');

// Create Order
exports.createOrder = async (req, res) => {
    const { userId, productId, amount, quantity } = req.body;
    if (!userId || !productId || !amount || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const order = new Order({ userId, productId, amount, quantity });
        await order.save();

        // Publish event
        await publish('order.created', order);

        res.status(201).location(`/orders/${order._id}`).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Orders (with optional filtering)
exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Order Status
exports.updateStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'cancelled'];

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: 'Invalid Order ID' });
    }
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Publish event
        await publish('order.statusUpdated', { orderId, status });

        res.json({ previousStatus: order.status, newStatus: status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: 'Invalid Order ID' });
    }

    try {
        const order = await Order.findByIdAndDelete(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
