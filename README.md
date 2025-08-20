# Orders Service

## Overview
The **Orders Service** is a RESTful microservice built for the GlobalBooks Inc. SOA & Microservices coursework. It manages the lifecycle of orders, including creation, retrieval, updating status, and deletion. It integrates with **MongoDB** for storage and **RabbitMQ** for messaging. The service also provides **Swagger API documentation** for easy testing and demonstration.

---

## Features
- Create, read, update, and delete orders
- Update order status (`pending`, `completed`, `cancelled`)
- MongoDB integration with Mongoose
- RabbitMQ messaging for asynchronous communication
- Swagger UI for API documentation
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

---

## Folder Structure
```
orders-service/
├─ controllers/        # Business logic for orders
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ utils/              # Utility files (RabbitMQ connection, helpers)
├─ index.js            # Entry point for the service
├─ package.json        # NPM dependencies
├─ Dockerfile          # Docker build configuration
└─ README.md           # Documentation
```

---

## Environment Variables
Create a `.env` file in the root of `orders-service/`:
```
PORT=3000
MONGODB_URL=mongodb://mongo:27017/ordersdb
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

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

## API Endpoints
See Swagger documentation at `http://localhost:3000/api-docs` for:
- POST `/orders` - Create an order
- GET `/orders` - Get all orders
- PATCH `/orders/:orderId/status` - Update order status
- DELETE `/orders/:orderId` - Delete an order

---

## Notes
- Ensure RabbitMQ is running on port 5672 before starting the service.
- Do not access port 5672 via browser; use RabbitMQ management at 15672 for UI.
- Swagger UI is automatically generated from route JSDoc comments.

---

## License
This project is for academic purposes (SOA & Microservices coursework).

