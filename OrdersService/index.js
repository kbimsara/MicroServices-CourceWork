const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const ordersRoutes = require("./routes/orders");
<<<<<<< Updated upstream
const { connectRabbitMQ, consume } = require("./utils/rabbitmq");
const soap = require("soap");
const fs = require("fs");
const OrdersSoapService = require("./OrdersSoapService");
=======
const { consume, publish } = require("./utils/rabbitmq");

const Order = require("./models/order.model"); // Added missing import for Order model
>>>>>>> Stashed changes

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
      // Removed securitySchemes related to JWT
    },
    // security: [{ bearerAuth: [] }], // Apply to all endpoints by default
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
<<<<<<< Updated upstream
    // Connect to RabbitMQ
    connectRabbitMQ().then(() => {
      console.log("Connected to RabbitMQ");
      // Example: Consume messages from an order-events queue
      consume("order-events", (message) => {
        console.log("Received message:", message);
        // Process the message, e.g., update order status in MongoDB
      });
    }).catch((err) => console.error("RabbitMQ connection error:", err));

    // Setup SOAP service
    const xml = fs.readFileSync("OrdersService/src/main/resources/wsdl/OrdersService.wsdl", "utf8");
    soap.listen(app, "/ws/orders", OrdersSoapService, xml, () => {
      console.log("Orders SOAP Service initialized on /ws/orders");
=======
    // Connect to RabbitMQ and start consuming
    console.log("Setting up RabbitMQ consumers...");
    // Example: Consume messages from an order-events queue
    consume("order-events", (message) => {
      console.log("Received message from order-events:", message);
      // This consumer is for example purposes. If you intend to process these messages,
      // ensure they are valid JSON and handle them accordingly.\n
    });

    // Consume commands from Orchestrator
    consume("order.create.command", async (message) => { // Removed authorization parameter
      let correlationId, replyTo; // Declare outside try block
      try {
        console.log(`OrdersService: message.userId: ${message.userId}`); // Added log

        ({ correlationId, replyTo, userId, productId, amount, quantity } = message); // Assign inside try block
        const newOrder = new Order({ userId, productId, amount, quantity, status: "pending" });
        await newOrder.save();
        publish(replyTo, { correlationId, status: "SUCCESS", data: { orderId: newOrder._id.toString(), status: newOrder.status } });
      } catch (error) {
        console.error("Error processing order.create.command:", error);
        if (correlationId && replyTo) { // Check if defined before publishing
            publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      }
    });

    consume("order.update.command", async (message) => { // Removed authorization parameter
      let correlationId, replyTo; // Declare outside try block
      try {
        console.log(`OrdersService: message.userId: ${message.userId}`); // Added log

        ({ correlationId, replyTo, orderId, status } = message); // Assign inside try block
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
        if (correlationId && replyTo) { // Check if defined before publishing
            publish(replyTo, { correlationId, status: "FAILED", error: error.message });
        }
      }
>>>>>>> Stashed changes
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));