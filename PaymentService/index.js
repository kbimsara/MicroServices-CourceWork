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

const PORT = 3001;
const MONGODB_URL = "mongodb://mongo:27017/globalbooks";
const RABBITMQ_URL = "amqp://guest:guest@rabbitmq:5672";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for PaymentService");
    app.listen(PORT, () => console.log(`PaymentService running on port ${PORT}`));
    // Set up RabbitMQ consumers
    console.log("Setting up RabbitMQ consumers for PaymentService");
    
    try {
      // Example: Consume messages from a payment-events queue
      consume("payment-events", (message) => {
        console.log("Received message in PaymentService:", message);
        // Process the message, e.g., update payment status in MongoDB
      });

      // Consume commands from Orchestrator
      consume("payment.create.command", async (message) => {
        let correlationId, replyTo; // Declared outside try block
        try {
          console.log("PaymentService: Received payment.create.command message:", JSON.stringify(message, null, 2));

          ({ correlationId, replyTo, orderId, userId, amount, method } = message); // Assigned inside try block
          
          // Validate required fields
          if (!replyTo) {
            console.error('PaymentService: replyTo is undefined in message');
            return;
          }
          
          if (!correlationId) {
            console.error('PaymentService: correlationId is undefined in message');
            return;
          }
          
          console.log("PaymentService: Extracted message details:", { correlationId, replyTo, orderId, userId, amount, method });

          // Convert string orderId to ObjectId
          const orderIdObjectId = new mongoose.Types.ObjectId(orderId);
          const newPayment = new Payment({ orderId: orderIdObjectId, userId, amount, method, status: "pending" });
          console.log("PaymentService: Attempting to save new payment:", newPayment);
          await newPayment.save();
          console.log("PaymentService: New payment saved successfully:", newPayment);

          console.log(`PaymentService: Publishing success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              paymentId: newPayment._id.toString(), 
              status: newPayment.status 
            }
          };
          
          console.log(`PaymentService: Sending success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("PaymentService: Error processing payment.create.command:", error);
          
          if (replyTo && correlationId) {
            const errorResponse = {
              correlationId: correlationId,
              error: error.message
            };
            publish(replyTo, errorResponse);
          }
        }
      });

      // Consume payment status update commands from Orchestrator
      consume("payment.update.command", async (message) => {
        let correlationId, replyTo; // Declared outside try block
        try {
          console.log("PaymentService: Received payment.update.command message:", JSON.stringify(message, null, 2));

          ({ correlationId, replyTo, paymentId, status } = message); // Assigned inside try block
          
          // Validate required fields
          if (!replyTo) {
            console.error('PaymentService: replyTo is undefined in message');
            return;
          }
          
          if (!correlationId) {
            console.error('PaymentService: correlationId is undefined in message');
            return;
          }
          
          console.log("PaymentService: Extracted message details:", { correlationId, replyTo, paymentId, status });

          // Update payment status
          const updatedPayment = await Payment.findByIdAndUpdate(
            paymentId, 
            { status: status }, 
            { new: true }
          );
          
          if (!updatedPayment) {
            throw new Error('Payment not found');
          }
          
          console.log("PaymentService: Payment status updated successfully:", updatedPayment);

          console.log(`PaymentService: Publishing success response to ${replyTo}`);
          
          // Send response in the format expected by the BPEL engine
          const response = {
            correlationId: correlationId,
            data: { 
              paymentId: updatedPayment._id.toString(), 
              status: updatedPayment.status 
            }
          };
          
          console.log(`PaymentService: Sending success response:`, JSON.stringify(response, null, 2));
          publish(replyTo, response);
        } catch (error) {
          console.error("PaymentService: Error processing payment.update.command:", error);
          
          if (replyTo && correlationId) {
            const errorResponse = {
              correlationId: correlationId,
              error: error.message
            };
            publish(replyTo, errorResponse);
          }
        }
      });
      
      console.log("RabbitMQ consumers set up successfully for PaymentService");
    } catch (error) {
      console.error("Failed to set up RabbitMQ consumers for PaymentService:", error);
      console.log("PaymentService will continue running without RabbitMQ functionality");
    }

  })
  .catch((err) => console.error("MongoDB connection error:", err));
