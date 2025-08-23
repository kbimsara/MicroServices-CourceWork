require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const paymentsRoutes = require("./routes/payments");
const { connectRabbitMQ, consume } = require("./utils/rabbitmq");
const soap = require("soap");
const fs = require("fs");
const PaymentSoapService = require("./PaymentSoapService");

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
    }).catch((err) => console.error("RabbitMQ connection error for PaymentService:", err));

    // Setup SOAP service
    const xml = fs.readFileSync("PaymentService/src/main/resources/wsdl/PaymentService.wsdl", "utf8");
    soap.listen(app, "/ws/payments", PaymentSoapService, xml, () => {
      console.log("Payment SOAP Service initialized on /ws/payments");
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
