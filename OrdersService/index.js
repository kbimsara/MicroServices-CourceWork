const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const ordersRoutes = require("./routes/orders");
const { consume, publish } = require("./utils/rabbitmq");

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

const PORT = 3000;
const MONGODB_URL = "mongodb://mongo:27017/globalbooks";
const RABBITMQ_URL = "amqp://guest:guest@rabbitmq:5672";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Orders Service running on port ${PORT}`)
    );
    // Connect to RabbitMQ and start consuming
    console.log("Setting up RabbitMQ consumers...");
    
    try {
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
          console.log(`OrdersService: Received message:`, JSON.stringify(message, null, 2));
          console.log(`OrdersService: Message type:`, typeof message);
          console.log(`OrdersService: Message keys:`, Object.keys(message || {}));
          console.log(`OrdersService: message.userId: ${message.userId}`); // Added log
          console.log(`OrdersService: message.replyTo: ${message.replyTo}`); // Debug replyTo
          console.log(`OrdersService: message.correlationId: ${message.correlationId}`); // Debug correlationId

          // Ensure message is an object
          if (typeof message === 'string') {
            try {
              message = JSON.parse(message);
              console.log(`OrdersService: Parsed string message to object:`, message);
            } catch (parseError) {
              console.error('OrdersService: Failed to parse string message:', parseError);
              return;
            }
          }

          // Handle Buffer messages (if they come as raw data)
          if (Buffer.isBuffer(message)) {
            try {
              message = JSON.parse(message.toString());
              console.log(`OrdersService: Parsed Buffer message to object:`, message);
            } catch (parseError) {
              console.error('OrdersService: Failed to parse Buffer message:', parseError);
              return;
            }
          }

          ({ correlationId, replyTo, userId, productId, amount, quantity } = message); // Assign inside try block
          
          console.log(`OrdersService: Extracted values:`, { correlationId, replyTo, userId, productId, amount, quantity });
          
          // Validate required fields
          if (!replyTo) {
            console.error('OrdersService: replyTo is undefined in message');
            console.error('OrdersService: Full message content:', message);
            console.error('OrdersService: Message structure analysis:');
            console.error('  - Has replyTo property:', 'replyTo' in message);
            console.error('  - replyTo value:', message.replyTo);
            console.error('  - replyTo type:', typeof message.replyTo);
            return;
          }
          
          if (!correlationId) {
            console.error('OrdersService: correlationId is undefined in message');
            console.error('OrdersService: Full message content:', message);
            console.error('OrdersService: Message structure analysis:');
            console.error('  - Has correlationId property:', 'correlationId' in message);
            console.error('  - correlationId value:', message.correlationId);
            console.error('  - correlationId type:', typeof message.correlationId);
            return;
          }
          
          const newOrder = new Order({ userId, productId, amount, quantity, status: "pending" });
          await newOrder.save();
          console.log(`OrdersService: Publishing success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              orderId: newOrder._id.toString(), 
              status: newOrder.status 
            }
          };
          
          console.log(`OrdersService: Sending success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("Error processing order.create.command:", error);
          if (correlationId && replyTo) { // Check if defined before publishing
              console.log(`OrdersService: Publishing error response to ${replyTo}`);
              
              // Send error response in the format expected by the BPEL engine
              const errorResponse = {
                correlationId: correlationId,
                error: error.message
              };
              
              console.log(`OrdersService: Sending error response:`, JSON.stringify(errorResponse, null, 2));
              publish(replyTo, errorResponse);
          } else {
              console.error("OrdersService: Cannot publish error response - missing correlationId or replyTo");
          }
        }
      });

      consume("order.update.command", async (message) => { // Removed authorization parameter
        let correlationId, replyTo; // Declare outside try block
        try {
          console.log(`OrdersService: Received update message:`, JSON.stringify(message, null, 2));
          console.log(`OrdersService: Message type:`, typeof message);
          console.log(`OrdersService: Message keys:`, Object.keys(message || {}));
          console.log(`OrdersService: message.userId: ${message.userId}`); // Added log

          ({ correlationId, replyTo, orderId, status } = message); // Assign inside try block
          
          console.log(`OrdersService: Extracted update values:`, { correlationId, replyTo, orderId, status });
          
          // Validate required fields
          if (!replyTo) {
            console.error('OrdersService: replyTo is undefined in update message');
            console.error('OrdersService: Full update message content:', message);
            return;
          }
          
          if (!correlationId) {
            console.error('OrdersService: correlationId is undefined in update message');
            console.error('OrdersService: Full update message content:', message);
            return;
          }
          
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
          console.log(`OrdersService: Publishing update success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              orderId: updatedOrder._id.toString(), 
              status: updatedOrder.status 
            }
          };
          
          console.log(`OrdersService: Sending update success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("Error processing order.update.command:", error);
          if (correlationId && replyTo) { // Check if defined before publishing
              console.log(`OrdersService: Publishing update error response to ${replyTo}`);
              
              // Send error response in the format expected by the BPEL engine
              const errorResponse = {
                correlationId: correlationId,
                error: error.message
              };
              
              console.log(`OrdersService: Sending update error response:`, JSON.stringify(errorResponse, null, 2));
              publish(replyTo, errorResponse);
          } else {
              console.error("OrdersService: Cannot publish update error response - missing correlationId or replyTo");
          }
        }
      });
      
      console.log("RabbitMQ consumers set up successfully");
    } catch (error) {
      console.error("Failed to set up RabbitMQ consumers:", error);
      console.log("Orders Service will continue running without RabbitMQ functionality");
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));