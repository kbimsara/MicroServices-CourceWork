# Orders, Payment, and Shipping Services

## Overview
The **Orders Service**, **Payment Service**, and **Shipping Service** are RESTful microservices built for the GlobalBooks Inc. SOA & Microservices coursework. They manage the lifecycle of orders, payments, and shipments, respectively. Each service integrates with **MongoDB** for storage, **RabbitMQ** for messaging, and provides **Swagger API documentation** for easy testing and demonstration. JWT authentication secures all endpoints.

---

## Features
### Orders Service
- Create, read, update, and delete orders
- Update order status (`pending`, `completed`, `cancelled`)

### Payment Service
- Create, read, update, and delete payments
- Update payment status (`pending`, `completed`, `failed`)
- Payment methods support (e.g., credit card, PayPal, bank transfer)

### Shipping Service
- Create, read, update, and delete shipments
- Update shipment status (`pending`, `shipped`, `delivered`, `cancelled`)
- Track shipment addresses

All services:
- MongoDB integration with Mongoose
- RabbitMQ messaging for asynchronous communication
- Swagger UI for API documentation with JWT authentication support
- Dockerized for easy deployment
- Ready for cloud deployment

---

## Technology Stack
- **Node.js** (v20)
- **Express.js** (v5)
- **MongoDB** (v7)
- **Mongoose** (v8)
- **RabbitMQ** (v3)
- **Swagger** (swagger-ui-express + swagger-jsdoc)
- **Docker & Docker Compose**
- **AMQP Messaging** via `amqplib`
- **Environment Variables** via `dotenv`
- **JWT Authentication** via `express-jwt`

---

## Folder Structure (for each service)
```
Order-Service/
├─ controllers/        # Business logic
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ utils/              # Utility files (RabbitMQ connection, helpers)
├─ middleware/         # JWT authentication
├─ index.js            # Entry point
├─ package.json        # NPM dependencies
└─ Dockerfile          # Docker build configuration

Payment-Service/
├─ controllers/        # Business logic
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ utils/              # Utility files (RabbitMQ connection, helpers)
├─ middleware/         # JWT authentication
├─ index.js            # Entry point
├─ package.json        # NPM dependencies
└─ Dockerfile          # Docker build configuration

Shipping-Service/
├─ controllers/        # Business logic
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ utils/              # Utility files (RabbitMQ connection, helpers)
├─ middleware/         # JWT authentication
├─ index.js            # Entry point
├─ package.json        # NPM dependencies
└─ Dockerfile          # Docker build configuration
README.md             # Documentation
```

---

## Environment Variables
Create a `.env` file in each service root:
```
PORT=<service_port>
MONGODB_URL=mongodb://mongo:27017/<service_db>
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=<your_jwt_secret_here>
```

> **Note:** Use a strong secret for JWT (`JWT_SECRET`).

---

## Running the Services

### Using Docker Compose
1. Ensure `docker-compose.yml` includes all three services.
2. Build and start all services:
```bash
docker-compose up --build
```
3. Access:
   - Orders API: `http://localhost:<orders_port>/orders`
   - Payment API: `http://localhost:<payment_port>/payments`
   - Shipping API: `http://localhost:<shipping_port>/shipments`
   - Swagger UI: `http://localhost:<service_port>/api-docs`
   - RabbitMQ management: `http://localhost:15672` (guest/guest)
   - MongoDB: `mongodb://localhost:27017/<service_db>`

### Using Node.js locally
1. Install dependencies in each service:
```bash
npm install
```
2. Start server:
```bash
npm run dev  # For development with nodemon
npm run server  # For production
```

---

## JWT Authentication
All endpoints are protected with JWT. Include a valid JWT in requests:
```
Authorization: Bearer <your_jwt_token>
```

### Using Swagger UI
1. Open Swagger UI: `http://localhost:<service_port>/api-docs`
2. Click **Authorize** (top-right).
3. Enter your JWT token in the format:
```
Bearer <your_jwt_token>
```
4. Click **Authorize** to enable authenticated requests.

---

## API Endpoints
### Orders Service
- **POST** `/orders` - Create an order
- **GET** `/orders` - Get all orders
- **PATCH** `/orders/:orderId/status` - Update order status
- **DELETE** `/orders/:orderId` - Delete an order

### Payment Service
- **POST** `/payments` - Create a payment (includes payment method)
- **GET** `/payments` - Get all payments
- **PATCH** `/payments/:paymentId/status` - Update payment status
- **DELETE** `/payments/:paymentId` - Delete a payment

### Shipping Service
- **POST** `/shipments` - Create a shipment
- **GET** `/shipments` - Get all shipments
- **PATCH** `/shipments/:shipmentId/status` - Update shipment status
- **DELETE** `/shipments/:shipmentId` - Delete a shipment

> JWT authorization is required for all endpoints.

---

## Notes
- Ensure RabbitMQ is running on port 5672 before starting services.
- Access RabbitMQ management UI at 15672, not 5672.
- Swagger UI auto-generates documentation from route JSDoc comments.
- Keep your `JWT_SECRET` private and secure.

---

## License
This project is for academic purposes (SOA & Microservices coursework).

