require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Order = require('./models/order.model');
const checkJwt = require('./middleware/auth'); // JWT middleware
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');


const app = express();
app.use(express.json());
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API documentation for Order Service",
    },
    servers: [
      {
        url: "http://localhost:3000", // change port if different
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // path to your files with JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Orders Service');
});

// Protect all /orders routes with JWT
app.use('/orders', checkJwt);

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

  const validStatuses = ['pending', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
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

// Delete order
app.delete('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// MongoDB connection
mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Orders Service running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
