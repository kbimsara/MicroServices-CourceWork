require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const shippingRoutes = require("./routes/shipments");

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

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB for ShippingService");
    app.listen(PORT, () => console.log(`ShippingService running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
