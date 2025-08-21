require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const ordersRoutes = require("./routes/orders");

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

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Orders Service running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
