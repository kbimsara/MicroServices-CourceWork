require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const paymentsRoutes = require("./routes/payments");
const { consume, publish } = require("./utils/rabbitmq");
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
      // Removed securitySchemes related to JWT
    },
    // security: [{ bearerAuth: [] }],
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
    // Set up RabbitMQ consumers
    console.log("Setting up RabbitMQ consumers for PaymentService");
    // Example: Consume messages from a payment-events queue
    consume("payment-events", (message) => {
      console.log("Received message in PaymentService:", message);
      // Process the message, e.g., update payment status in MongoDB
    });

    // Consume commands from Orchestrator
    consume("payment.create.command", async (message) => {
      let correlationId, replyTo; // Declared outside try block
      try {
        console.log("PaymentService: Received payment.create.command message:", message);

        ({ correlationId, replyTo, orderId, userId, amount, method } = message); // Assigned inside try block
        console.log("PaymentService: Extracted message details:", { correlationId, replyTo, orderId, userId, amount, method });

        const newPayment = new Payment({ orderId, userId, amount, method, status: "pending" });
        console.log("PaymentService: Attempting to save new payment:", newPayment);
        await newPayment.save();
        console.log("PaymentService: New payment saved successfully:", newPayment);

        publish(replyTo, { correlationId, status: "SUCCESS", data: { paymentId: newPayment._id.toString(), status: newPayment.status } });
        console.log("PaymentService: Reply published for correlationId:", correlationId);
      } catch (error) {
        console.error("Error processing payment.create.command:", error);
        if (correlationId && replyTo) { // Check if defined before publishing
            publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      }
    });

  })
  .catch((err) => console.error("MongoDB connection error:", err));
