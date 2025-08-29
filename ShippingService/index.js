const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const shippingRoutes = require("./routes/shipments");
const { consume, publish } = require("./utils/rabbitmq");
const fs = require("fs");

const Shipping = require("./models/shipping.model"); // Added this import for the new consumer

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
      // Removed securitySchemes related to JWT
    },
    // security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health route
app.get("/", (req, res) => res.send("Welcome to Shipping Service"));

// Mount routes
app.use("/shipments", shippingRoutes);

const PORT = 3002;
const MONGODB_URL = "mongodb://mongo:27017/globalbooks";
const RABBITMQ_URL = "amqp://guest:guest@rabbitmq:5672";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for ShippingService");
    app.listen(PORT, () => console.log(`ShippingService running on port ${PORT}`));
    // Set up RabbitMQ consumers
    console.log("Setting up RabbitMQ consumers for ShippingService");
    
    try {
      // Example: Consume messages from a shipping-events queue
      consume("shipping-events", (message) => {
        console.log("Received message in ShippingService:", message);
        // Process the message, e.g., update shipping status in MongoDB
      });

      // Consume commands from Orchestrator
      consume("shipping.create.command", async (message) => {
        try {
          console.log("ShippingService: Received shipping.create.command message:", JSON.stringify(message, null, 2));
          
          // Ensure the userId from the token matches the userId in the message if applicable
          // if (userIdFromToken && userIdFromToken !== message.userId) {
          //     console.warn("ShippingService: WARNING - User ID mismatch between token and message. Using message.userId.");
          // }

          const { correlationId, replyTo, orderId, userId, address } = message;
          
          // Validate required fields
          if (!replyTo) {
            console.error('ShippingService: replyTo is undefined in message');
            return;
          }
          
          if (!correlationId) {
            console.error('ShippingService: correlationId is undefined in message');
            return;
          }
          
          // Convert string orderId to ObjectId
          const orderIdObjectId = new mongoose.Types.ObjectId(orderId);
          const newShipping = new Shipping({ orderId: orderIdObjectId, userId, address, status: "pending" });
          await newShipping.save();
          console.log(`ShippingService: Publishing success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              shipmentId: newShipping._id.toString(), 
              status: newShipping.status 
            }
          };
          
          console.log(`ShippingService: Sending success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("ShippingService: Error processing shipping.create.command:", error);
          
          if (replyTo && correlationId) {
            const errorResponse = {
              correlationId: correlationId,
              error: error.message
            };
            publish(replyTo, errorResponse);
          }
        }
      });

      // Consume shipping status update commands from Orchestrator
      consume("shipping.update.command", async (message) => {
        let correlationId, replyTo; // Declared outside try block
        try {
          console.log("ShippingService: Received shipping.update.command message:", JSON.stringify(message, null, 2));

          ({ correlationId, replyTo, shipmentId, status } = message); // Assigned inside try block
          
          // Validate required fields
          if (!replyTo) {
            console.error('ShippingService: replyTo is undefined in message');
            return;
          }
          
          if (!correlationId) {
            console.error('ShippingService: correlationId is undefined in message');
            return;
          }
          
          console.log("ShippingService: Extracted message details:", { correlationId, replyTo, shipmentId, status });

          // Update shipping status
          const updatedShipping = await Shipping.findByIdAndUpdate(
            shipmentId, 
            { status: status }, 
            { new: true }
          );
          
          if (!updatedShipping) {
            throw new Error('Shipment not found');
          }
          
          console.log("ShippingService: Shipping status updated successfully:", updatedShipping);

          console.log(`ShippingService: Publishing success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              shipmentId: updatedShipping._id.toString(), 
              status: updatedShipping.status 
            }
          };
          
          console.log(`ShippingService: Sending success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("ShippingService: Error processing shipping.update.command:", error);
          
          if (replyTo && correlationId) {
            const errorResponse = {
              correlationId: correlationId,
              error: error.message
            };
            publish(replyTo, errorResponse);
          }
        }
      });
      
      console.log("RabbitMQ consumers set up successfully for ShippingService");
    } catch (error) {
      console.error("Failed to set up RabbitMQ consumers for ShippingService:", error);
      console.log("ShippingService will continue running without RabbitMQ functionality");
    }

  })
  .catch((err) => console.error("MongoDB connection error:", err));
