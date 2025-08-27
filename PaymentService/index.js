require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const paymentsRoutes = require("./routes/payments");
const { connectRabbitMQ, consume, publish } = require("./utils/rabbitmq");
const fs = require("fs");
const Payment = require("./models/payment.model"); // Added this import for the new consumer

const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payment Service API",
      version: "1.0.0",
      description: "API documentation for Payment Service",
    },
    servers: [{ url: "http://localhost:3001" }],
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
app.get("/", (req, res) => res.send("Welcome to Payment Service"));

// Mount routes
app.use("/payments", paymentsRoutes);

const PORT = process.env.PORT || 3001;
const MONGODB_URL = process.env.MONGODB_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for PaymentService");
    app.listen(PORT, () => console.log(`PaymentService running on port ${PORT}`));
    // Connect to RabbitMQ
    connectRabbitMQ().then(() => {
      console.log("Connected to RabbitMQ for PaymentService");
      // Example: Consume messages from a payment-events queue
      consume("payment-events", (message) => {
        console.log("Received message in PaymentService:", message);
        // Process the message, e.g., update payment status in MongoDB
      });

      // Consume commands from Orchestrator
      consume("payment.create.command", async (message) => {
        const { correlationId, replyTo, orderId, userId, amount, method } = JSON.parse(message);
        try {
          const newPayment = new Payment({ orderId, userId, amount, method, status: "pending" });
          await newPayment.save();
          publish(replyTo, { correlationId, status: "SUCCESS", data: { paymentId: newPayment._id.toString(), status: newPayment.status } });
        } catch (error) {
          console.error("Error processing payment.create.command:", error);
          publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      });

    }).catch((err) => console.error("RabbitMQ connection error for PaymentService:", err));

  })
  .catch((err) => console.error("MongoDB connection error:", err));
