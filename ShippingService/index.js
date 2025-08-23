require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const shippingRoutes = require("./routes/shipments");
const { connectRabbitMQ, consume } = require("./utils/rabbitmq");
const soap = require("soap");
const fs = require("fs");
const ShippingSoapService = require("./ShippingSoapService");

const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shipping Service API",
      version: "1.0.0",
      description: "API documentation for Shipping Service",
    },
    servers: [{ url: "http://localhost:3002" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health route
app.get("/", (req, res) => res.send("Welcome to Shipping Service"));

// Mount routes
app.use("/shipments", shippingRoutes);

const PORT = process.env.PORT || 3002;
const MONGODB_URL = process.env.MONGODB_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for ShippingService");
    app.listen(PORT, () => console.log(`ShippingService running on port ${PORT}`));
    // Connect to RabbitMQ
    connectRabbitMQ().then(() => {
      console.log("Connected to RabbitMQ for ShippingService");
      // Example: Consume messages from a shipping-events queue
      consume("shipping-events", (message) => {
        console.log("Received message in ShippingService:", message);
        // Process the message, e.g., update shipping status in MongoDB
      });
    }).catch((err) => console.error("RabbitMQ connection error for ShippingService:", err));

    // Setup SOAP service
    const xml = fs.readFileSync("ShippingService/src/main/resources/wsdl/ShippingService.wsdl", "utf8");
    soap.listen(app, "/ws/shipping", ShippingSoapService, xml, () => {
      console.log("Shipping SOAP Service initialized on /ws/shipping");
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
