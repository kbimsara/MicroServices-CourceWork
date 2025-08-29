# GlobalBooks ESB Orchestrator Service with BPEL Workflow Engine

## 🎯 **Project Overview**

The **GlobalBooks ESB Orchestrator Service** is a comprehensive microservices architecture that implements **Enterprise Service Bus (ESB)** patterns with **BPEL (Business Process Execution Language)** workflow orchestration. This system manages the complete lifecycle of book purchases through asynchronous messaging, workflow orchestration, and microservices integration.

### **🏗️ Architecture Highlights**
- **ESB Pattern**: Centralized message routing and orchestration
- **BPEL Workflow Engine**: Business process automation for purchase orders
- **Microservices Architecture**: Decoupled services for orders, payments, and shipping
- **Asynchronous Messaging**: RabbitMQ-based event-driven communication
- **Dead Letter Queues**: Robust error handling and retry mechanisms
- **Comprehensive API Documentation**: Swagger UI for all endpoints

---

## 🚀 **System Architecture**

### **📊 High-Level System Diagram**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                              │
└─────────────────────┬─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESB ORCHESTRATOR SERVICE (Port 3003)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BPEL WORKFLOW ENGINE                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │  │   CREATE    │  │  PROCESS    │  │   ARRANGE   │                │   │
│  │  │    ORDER    │  │  PAYMENT    │  │  SHIPPING   │                │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SWAGGER UI API DOCUMENTATION                     │   │
│  │                    http://localhost:3003/api-docs                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────┬─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RABBITMQ ESB (Port 5672)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   ORDERS    │  │   PAYMENT   │  │  SHIPPING   │  │   EVENTS    │     │
│  │   QUEUES    │  │   QUEUES    │  │   QUEUES    │  │   QUEUES    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────┬─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MICROSERVICES LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   ORDERS    │  │   PAYMENT   │  │  SHIPPING   │  │   CATALOG   │     │
│  │  SERVICE    │  │   SERVICE   │  │   SERVICE   │  │   SERVICE   │     │
│  │  (Port 3000)│  │ (Port 3001) │  │ (Port 3002) │  │ (Port 8080)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────┬─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   ORDERS    │  │   PAYMENT   │  │  SHIPPING   │  │   CATALOG   │     │
│  │   MONGODB   │  │   MONGODB   │  │   MONGODB   │  │   MONGODB   │     │
│  │  DATABASE   │  │  DATABASE   │  │  DATABASE   │  │  DATABASE   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ **Project Structure**

```
MicroServices-CourceWork/
├── 📁 OrchestratorService/           # ESB Orchestrator with BPEL Engine
│   ├── 📁 bpel-workflow-engine/      # BPEL workflow execution engine
│   ├── 📁 placeorder-workflow/       # PlaceOrder workflow definition
│   ├── 📁 utils/                     # RabbitMQ utilities and ESB config
│   ├── 📄 index.js                   # Main orchestrator service
│   ├── 📄 package.json               # Dependencies and scripts
│   └── 📄 Dockerfile                 # Container configuration
│
├── 📁 OrdersService/                  # Order management microservice
│   ├── 📁 controllers/               # Business logic controllers
│   ├── 📁 models/                    # MongoDB data models
│   ├── 📁 routes/                    # Express.js API routes
│   ├── 📁 utils/                     # RabbitMQ and utility functions
│   ├── 📄 index.js                   # Service entry point
│   ├── 📄 package.json               # Dependencies
│   └── 📄 Dockerfile                 # Container configuration
│
├── 📁 PaymentService/                 # Payment processing microservice
│   ├── 📁 controllers/               # Payment business logic
│   ├── 📁 models/                    # Payment data models
│   ├── 📁 routes/                    # Payment API routes
│   ├── 📁 utils/                     # RabbitMQ utilities
│   ├── 📄 index.js                   # Service entry point
│   ├── 📄 package.json               # Dependencies
│   └── 📄 Dockerfile                 # Container configuration
│
├── 📁 ShippingService/                # Shipping management microservice
│   ├── 📁 controllers/               # Shipping business logic
│   ├── 📁 models/                    # Shipping data models
│   ├── 📁 routes/                    # Shipping API routes
│   ├── 📁 utils/                     # RabbitMQ utilities
│   ├── 📄 index.js                   # Service entry point
│   ├── 📄 package.json               # Dependencies
│   └── 📄 Dockerfile                 # Container configuration
│
├── 📁 CatalogService/                 # Product catalog microservice
│   ├── 📁 src/                       # Java source code
│   ├── 📄 pom.xml                    # Maven configuration
│   └── 📄 Dockerfile                 # Container configuration
│
├── 📁 token-Gen/                     # OAuth2 token generation tools
│   ├── 📄 generate-token.bat         # Windows batch script for tokens
│   ├── 📄 generate-token.ps1         # PowerShell token generator
│   ├── 📄 test-token.ps1             # Token testing script
│   ├── 📄 README.md                  # Token tools documentation
│   └── 📄 TOKEN-GENERATOR-README.md  # Technical token documentation
│
├── 📄 docker-compose.yml             # Multi-service orchestration
├── 📄 README.md                      # This documentation
└── 📄 .env                           # Environment configuration
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v20+) for local development
- **MongoDB** (v7.0+) for local development
- **RabbitMQ** (v3.12+) for local development

### **1. Clone and Setup**
```bash
git clone <your-repository-url>
cd MicroServices-CourceWork
```

### **2. Start All Services (Recommended)**
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### **3. Access Services**
| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **ESB Orchestrator** | http://localhost:3003 | 3003 | Main orchestration service |
| **Swagger UI** | http://localhost:3003/api-docs | 3003 | Complete API documentation |
| **Orders Service** | http://localhost:3000 | 3000 | Order management API |
| **Payment Service** | http://localhost:3001 | 3001 | Payment processing API |
| **Shipping Service** | http://localhost:3002 | 3002 | Shipping management API |
| **Catalog Service** | http://localhost:8080 | 8080 | Product catalog API |
| **RabbitMQ Management** | http://localhost:15672 | 15672 | Message queue monitoring |
| **MongoDB** | mongodb://localhost:27017 | 27017 | Database access |

---

## 📚 **Swagger UI Documentation**

### **🎯 Access Swagger UI**
The **ESB Orchestrator Service** provides comprehensive API documentation through Swagger UI:

**URL**: `http://localhost:3003/api-docs`

### **📋 Available API Sections**

#### **🏷️ Purchase Section**
- **POST** `/purchase` - Create new purchase orders using BPEL workflow
- **GET** `/purchase/order/{orderId}` - Get comprehensive purchase details by order ID

#### **🔧 Workflow Section**
- **GET** `/workflows` - Get all workflow instances and their status
- **GET** `/workflow/{workflowId}` - Get specific workflow status by ID

#### **⚙️ Configuration Section**
- **GET** `/workflow-definition` - Get BPEL workflow definition and steps
- **GET** `/esb-config` - Get ESB configuration including queues and exchanges

#### **💚 Health Section**
- **GET** `/health` - Service health check and component status

### **🧪 Interactive Testing Features**
- **Try it out**: Test all endpoints directly from Swagger UI
- **Request/Response Examples**: Real data examples for testing
- **Schema Validation**: Complete request/response schemas
- **Error Documentation**: All possible error responses documented

---

## 🔐 **OAuth2 Authentication**

The system implements **OAuth2 authentication** with JWT tokens for secure API access to all protected endpoints.

### **🔑 Available Authentication Methods:**

1. **Client Credentials Flow** - For service-to-service communication
2. **Password Grant Flow** - For user authentication  
3. **Scope-based Authorization** - Fine-grained access control (`read`, `write`, `admin`)

### **📁 Token Generation Tools:**

All token generation tools are located in the **`token-Gen/`** directory:

- **`token-Gen/generate-token.bat`** - Windows batch script for interactive token generation
- **`token-Gen/generate-token.ps1`** - PowerShell script for token generation and testing
- **`token-Gen/test-token.ps1`** - PowerShell script to test token functionality
- **`token-Gen/README.md`** - Comprehensive documentation for all token tools

### **🚀 Quick Token Generation:**

```bash
# Navigate to token generation directory
cd token-Gen

# Generate token using batch file (Windows)
generate-token.bat

# Generate token using PowerShell
.\generate-token.ps1

# Quick client token generation
.\generate-token.ps1 -Method client
```

### **🔒 Protected Endpoints:**

All API endpoints (except `/health` and `/oauth2/*`) require valid OAuth2 tokens:

- **Authorization Header**: `Authorization: Bearer YOUR_TOKEN_HERE`
- **Token Lifetime**: 1 hour (3600 seconds)
- **Required Scopes**: 
  - `read` - For GET endpoints
  - `write` - For POST/PUT endpoints
  - `admin` - For administrative operations

### **🧪 Testing with Tokens:**

1. **Generate token** using tools in `token-Gen/` directory
2. **Add Authorization header** to your requests
3. **Test protected endpoints** with valid tokens

---

## 🔌 **API Endpoints Documentation**

### **🎯 ESB Orchestrator Service (Port 3003)**

#### **POST /purchase**
**Description**: Initiates a complete purchase workflow using BPEL orchestration
**Request Body**:
```json
{
  "userId": "student_123",
  "productId": "ISBN_9780140283338",
  "quantity": 1,
  "amount": 89.99,
  "paymentMethod": "credit_card",
  "shippingAddress": "123 University Ave, College City, CA 90210"
}
```
**Response**: Complete purchase details including order, payment, and shipping information

#### **GET /purchase/order/{orderId}**
**Description**: Retrieves comprehensive purchase details by order ID
**Parameters**: `orderId` (MongoDB ObjectId)
**Example**: `GET /purchase/order/68b1d8e4de0fd3ed24701f5c`
**Response**: Aggregated data from all microservices

#### **GET /workflows**
**Description**: Lists all workflow instances and their current status
**Response**: Array of workflow objects with status, current step, and metadata

#### **GET /workflow/{workflowId}**
**Description**: Gets specific workflow status and execution details
**Parameters**: `workflowId` (UUID)
**Response**: Workflow execution state and progress

#### **GET /workflow-definition**
**Description**: Returns BPEL workflow definition and configuration
**Response**: Workflow steps, timeouts, and execution rules

#### **GET /esb-config**
**Description**: Shows ESB configuration including queues and exchanges
**Response**: RabbitMQ configuration and queue definitions

#### **GET /health**
**Description**: Service health check and component status
**Response**: Health status of all components (BPEL Engine, RabbitMQ, etc.)

### **📦 Orders Service (Port 3000)**
- **POST** `/orders` - Create new orders
- **GET** `/orders` - Get all orders
- **GET** `/orders/:orderId` - Get order by ID
- **PATCH** `/orders/:orderId/status` - Update order status
- **DELETE** `/orders/:orderId` - Delete order

### **💳 Payment Service (Port 3001)**
- **POST** `/payments` - Create new payments
- **GET** `/payments` - Get all payments
- **GET** `/payments/:paymentId` - Get payment by ID
- **GET** `/payments/order/:orderId` - Get payment by order ID
- **PATCH** `/payments/:paymentId/status` - Update payment status
- **DELETE** `/payments/:paymentId` - Delete payment

### **🚚 Shipping Service (Port 3002)**
- **POST** `/shipments` - Create new shipments
- **GET** `/shipments` - Get all shipments
- **GET** `/shipments/:shipmentId` - Get shipment by ID
- **GET** `/shipments/order/:orderId` - Get shipment by order ID
- **PATCH** `/shipments/:shipmentId/status` - Update shipment status
- **DELETE** `/shipments/:shipmentId` - Delete shipment

---

## 🔄 **BPEL Workflow Engine**

### **🏗️ Workflow Architecture**
The system implements a **BPEL (Business Process Execution Language)** workflow engine that orchestrates the complete purchase process:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLACEORDER WORKFLOW                              │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │   STEP 1    │───▶│   STEP 2    │───▶│   STEP 3    │                    │
│  │  CREATE     │    │  PROCESS    │    │  ARRANGE    │                    │
│  │   ORDER     │    │  PAYMENT    │    │  SHIPPING   │                    │
│  └─────────────┘    └─────────────┘    └─────────────┘                    │
│         │                   │                   │                         │
│         ▼                   ▼                   ▼                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │   SUCCESS   │    │   SUCCESS   │    │   SUCCESS   │                    │
│  │   FAILURE   │    │   FAILURE   │    │   FAILURE   │                    │
│  └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    COMPENSATION LOGIC                              │   │
│  │              (Rollback on any step failure)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **⚙️ Workflow Features**
- **Step-by-step execution** with timeout handling
- **Automatic retry mechanisms** with exponential backoff
- **Compensation logic** for workflow rollback on failures
- **Dead letter queues** for error handling and monitoring
- **Correlation ID tracking** for message correlation
- **Reply queue management** for request-response patterns

---

## 🐰 **RabbitMQ ESB Configuration**

### **📨 Message Queues**
The system uses RabbitMQ as the Enterprise Service Bus with the following queue structure:

#### **Command Queues**
- `order.create.command` - Order creation commands
- `order.update.command` - Order status updates
- `payment.create.command` - Payment processing commands
- `payment.update.command` - Payment status updates
- `shipping.create.command` - Shipping arrangement commands
- `shipping.update.command` - Shipping status updates

#### **Event Queues**
- `order.created.event` - Order creation events
- `order.updated.event` - Order update events
- `payment.processed.event` - Payment completion events
- `shipping.arranged.event` - Shipping arrangement events

#### **Dead Letter Queues**
- `esb.dlq` - Failed message handling
- `esb.retry` - Retry mechanism for failed messages

### **🔄 Exchange Configuration**
- **Main Exchange**: `esb.exchange` (topic-based routing)
- **Dead Letter Exchange**: `esb.dlx` (failed message handling)

---

## 🛠️ **Development and Testing**

### **🔧 Local Development Setup**
```bash
# Install dependencies for each service
cd OrchestratorService && npm install
cd ../OrdersService && npm install
cd ../PaymentService && npm install
cd ../ShippingService && npm install

# Start services individually
cd OrchestratorService && npm run dev
cd ../OrdersService && npm run dev
cd ../PaymentService && npm run dev
cd ../ShippingService && npm run dev
```

### **🧪 Testing the System**
1. **Start all services**: `docker-compose up -d`
2. **Open Swagger UI**: http://localhost:3003/api-docs
3. **Test purchase workflow**:
   - Use POST `/purchase` with sample data
   - Monitor workflow execution
   - Check order, payment, and shipping status
4. **Monitor RabbitMQ**: http://localhost:15672 (guest/guest)

### **📊 Monitoring and Debugging**
- **Service Logs**: `docker-compose logs -f [service-name]`
- **RabbitMQ Management**: http://localhost:15672
- **MongoDB Compass**: Connect to mongodb://localhost:27017
- **Health Checks**: GET `/health` endpoint on each service

---

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Services not starting**: Check Docker and Docker Compose versions
2. **RabbitMQ connection failed**: Ensure RabbitMQ container is healthy
3. **MongoDB connection failed**: Check MongoDB container status
4. **Swagger UI not loading**: Verify service is running and accessible

### **Debug Commands**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs orchestratorservice
docker-compose logs orders-service
docker-compose logs payment-service
docker-compose logs shipping-service

# Restart specific service
docker-compose restart orchestratorservice

# Rebuild and restart
docker-compose up -d --build
```

---

## 📚 **Technology Stack**

### **🔄 Backend Services**
- **Node.js** (v20) - Runtime environment
- **Express.js** (v5) - Web framework
- **MongoDB** (v7) - Document database
- **Mongoose** (v8) - MongoDB ODM
- **RabbitMQ** (v3.12) - Message broker
- **AMQP** - Advanced Message Queuing Protocol

### **🏗️ Orchestration & Workflow**
- **BPEL Engine** - Business Process Execution Language
- **ESB Pattern** - Enterprise Service Bus architecture
- **Event-Driven Architecture** - Asynchronous messaging
- **Dead Letter Queues** - Error handling and retry mechanisms

### **📖 API Documentation**
- **Swagger UI** - Interactive API documentation
- **OpenAPI 3.0** - API specification standard
- **JSDoc** - Code documentation generation

### **🐳 Containerization & Deployment**
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **Multi-stage builds** - Optimized container images

---

## 📈 **Performance & Scalability**

### **🚀 Performance Features**
- **Asynchronous processing** for non-blocking operations
- **Connection pooling** for database and message broker
- **Efficient message routing** through RabbitMQ
- **Optimized database queries** with Mongoose

### **📈 Scalability Considerations**
- **Horizontal scaling** of individual microservices
- **Load balancing** through container orchestration
- **Message queue scaling** for high-throughput scenarios
- **Database sharding** for large datasets

---

## 🔒 **Security & Best Practices**

### **🛡️ Security Features**
- **Input validation** and sanitization
- **Error handling** without information leakage
- **Rate limiting** for API endpoints
- **Secure configuration** management

### **📋 Best Practices**
- **Microservices principles** - Single responsibility, loose coupling
- **Event-driven architecture** - Asynchronous communication
- **Dead letter queues** - Robust error handling
- **Health checks** - Service monitoring and alerting
- **Comprehensive logging** - Debugging and monitoring

---

## 📄 **License & Acknowledgments**

### **📜 License**
This project is developed for academic purposes as part of the **SOA & Microservices coursework**.

### **🙏 Acknowledgments**
- **GlobalBooks Inc.** - Business domain inspiration
- **Academic Community** - SOA and microservices research
- **Open Source Community** - Tools and frameworks used

---

## 📞 **Support & Contact**

### **🐛 Issue Reporting**
For technical issues or questions:
1. Check the troubleshooting section above
2. Review service logs for error details
3. Verify all services are running and healthy
4. Test individual endpoints through Swagger UI

### **📚 Additional Resources**
- **Swagger UI**: http://localhost:3003/api-docs
- **RabbitMQ Management**: http://localhost:15672
- **Service Health**: GET `/health` on each service
- **Project Repository**: Check source code for implementation details

---

**🎯 Happy coding with your ESB Orchestrator Service! 🚀**

