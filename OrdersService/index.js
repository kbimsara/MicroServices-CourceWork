require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ordersRouter = require('./routes/orders');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: { title: 'Orders Service API', version: '1.0.0' }
    },
    apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/orders', ordersRouter);

// Default route
app.get('/', (req, res) => res.send('Welcome to Orders Service'));

// MongoDB connection
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Orders Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
