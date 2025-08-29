# GlobalBooks ESB Orchestrator Service - Project Overview

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

## 🎯 **Business Use Case**

### **GlobalBooks Purchase Workflow**
This system manages the complete lifecycle of book purchases:

1. **Customer places order** for books
2. **System validates** product availability and pricing
3. **Payment processing** with multiple payment methods
4. **Shipping arrangement** with address validation
5. **Order fulfillment** and status tracking
6. **Complete audit trail** of the entire process

### **Key Business Benefits**
- **Automated Workflow**: Reduces manual intervention
- **Error Handling**: Automatic retry and compensation
- **Scalability**: Handles multiple concurrent orders
- **Reliability**: Dead letter queues and retry mechanisms
- **Monitoring**: Real-time workflow status tracking

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

## 📄 **License & Acknowledgments**

### **📜 License**
This project is developed for academic purposes as part of the **SOA & Microservices coursework**.

### **🙏 Acknowledgments**
- **GlobalBooks Inc.** - Business domain inspiration
- **Academic Community** - SOA and microservices research
- **Open Source Community** - Tools and frameworks used

---

**🎯 This documentation provides a comprehensive overview of the GlobalBooks ESB Orchestrator Service project structure, architecture, and implementation details.**
