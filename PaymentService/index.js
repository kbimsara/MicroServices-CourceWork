require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const paymentsRoutes = require("./routes/payments");

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

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for PaymentService");
    app.listen(PORT, () => console.log(`PaymentService running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
