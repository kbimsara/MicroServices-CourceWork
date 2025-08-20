const express = require('express');
const mongoose = require('mongoose');
const Order = require('./models/order.model');
const app = express();
require('dotenv').config();

// Use environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

app.listen(PORT, () => {
    console.log(`Orders Service is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Orders Service');
});

app.post('/orders', express.json(), async (req, res) => {
    const { userId, productId, amount, quantity } = req.body;
    if (!userId || !productId || !amount|| !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const order = new Order({ userId, productId, amount, quantity });
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
