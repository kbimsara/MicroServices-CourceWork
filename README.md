# Orders Service

## Overview
The **Orders Service** is a RESTful microservice built for the GlobalBooks Inc. SOA & Microservices coursework. It manages the lifecycle of orders, including creation, retrieval, updating status, and deletion. The service integrates with **MongoDB** for storage, **RabbitMQ** for messaging, and provides **Swagger API documentation** for easy testing and demonstration. JWT authentication is used to secure all order endpoints.

---

## Features
- Create, read, update, and delete orders
- Update order status (`pending`, `completed`, `cancelled`)
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

## Folder Structure
```
orders-service/
├─ controllers/        # Business logic for orders
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ utils/              # Utility files (RabbitMQ connection, helpers)
├─ middleware/         # JWT authentication
├─ index.js            # Entry point for the service
├─ package.json        # NPM dependencies
└─ Dockerfile          # Docker build configuration
README.md           # Documentation
```

---

## Environment Variables
Create a `.env` file in the root of `orders-service/`:
```
PORT=3000
MONGODB_URL=mongodb://mongo:27017/ordersdb
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=<your_jwt_secret_here>
```

> **Note:** Use a strong secret for JWT (`JWT_SECRET`). Example:  
> `JWT_SECRET=dYhSx6+9k7p2z0P7x4P4WlWqkWfQb8cBqV0j7P1NZZc=`

---

## Running the Service

### Using Docker Compose
1. Ensure `docker-compose.yml` is in the parent folder.
2. Build and start all services:
```bash
docker-compose up --build
```
3. Services:
   - Orders API: `http://localhost:3000/orders`
   - Swagger UI: `http://localhost:3000/api-docs`
   - RabbitMQ management: `http://localhost:15672` (guest/guest)
   - MongoDB: `mongodb://localhost:27017/ordersdb`

### Using Node.js locally
1. Install dependencies:
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

All `/orders` endpoints are protected with JWT. You must include a valid JWT in the request:

**HTTP Header**
```
Authorization: Bearer <your_jwt_token>
```

### Using Swagger UI
1. Open Swagger UI: `http://localhost:3000/api-docs`
2. Click the **Authorize** button (top-right corner).
3. Enter your JWT token in the input box in this format:
```
Bearer <your_jwt_token>
```
4. Click **Authorize**. Now all requests from Swagger UI will include the token automatically.

---

## API Endpoints
See Swagger documentation at `http://localhost:3000/api-docs` for details:

- **POST** `/orders` - Create an order  
- **GET** `/orders` - Get all orders  
- **PATCH** `/orders/:orderId/status` - Update order status  
- **DELETE** `/orders/:orderId` - Delete an order  

> JWT authorization is required for all endpoints.

---

## Notes
- Ensure RabbitMQ is running on port 5672 before starting the service.
- Do not access port 5672 via browser; use RabbitMQ management at 15672 for UI.
- Swagger UI automatically generates documentation from route JSDoc comments.
- Always keep your `JWT_SECRET` private and secure.

---

## License
This project is for academic purposes (SOA & Microservices coursework).

