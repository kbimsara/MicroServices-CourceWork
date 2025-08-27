require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const ordersRoutes = require("./routes/orders");
const { connectRabbitMQ, consume, publish } = require("./utils/rabbitmq");

const Order = require("./models/order.model"); // Added missing import for Order model

const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API documentation for Order Service",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }], // Apply to all endpoints by default
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health/default route
app.get("/", (req, res) => {
  res.send("Welcome to the Orders Service");
});

// Mount orders routes (JWT applied inside router)
app.use("/orders", ordersRoutes);

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Orders Service running on port ${PORT}`)
    );
    // Connect to RabbitMQ
    connectRabbitMQ().then(() => {
      console.log("Connected to RabbitMQ");
      // Example: Consume messages from an order-events queue
      consume("order-events", (message) => {
        console.log("Received message:", message);
        // Process the message, e.g., update order status in MongoDB
      });

      // Consume commands from Orchestrator
      consume("order.create.command", async (message) => {
        const { correlationId, replyTo, userId, productId, amount, quantity } = JSON.parse(message);
        try {
          const newOrder = new Order({ userId, productId, amount, quantity, status: "pending" });
          await newOrder.save();
          publish(replyTo, { correlationId, status: "SUCCESS", data: { orderId: newOrder._id.toString(), status: newOrder.status } });
        } catch (error) {
          console.error("Error processing order.create.command:", error);
          publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      });

      consume("order.update.command", async (message) => {
        const { correlationId, replyTo, orderId, status } = JSON.parse(message);
        try {
          if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new Error("Invalid Order ID");
          }
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
          );
          if (!updatedOrder) {
            throw new Error("Order not found");
          }
          publish(replyTo, { correlationId, status: "SUCCESS", data: { orderId: updatedOrder._id.toString(), status: updatedOrder.status } });
        } catch (error) {
          console.error("Error processing order.update.command:", error);
          publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      });

    }).catch((err) => console.error("RabbitMQ connection error:", err));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
