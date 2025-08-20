const express = require('express');
const mongoose = require('mongoose');
const Order = require('./models/order.model');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Orders Service');
});

// Create order
app.post('/orders', async (req, res) => {
    const { userId, productId, amount, quantity } = req.body;

    if (!userId || !productId || !amount || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const order = new Order({ userId, productId, amount, quantity });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update order status
app.patch('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true } // return updated document
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// MongoDB connection
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    // Start server only after DB connection
    app.listen(PORT, () => {
        console.log(`Orders Service is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
