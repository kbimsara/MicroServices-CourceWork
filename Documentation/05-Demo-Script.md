# Demo Script
## GlobalBooks ESB Orchestrator Service

---

## 🎯 **Demo Overview**

This demo script provides a step-by-step guide for demonstrating the GlobalBooks ESB Orchestrator Service during the viva presentation. The demo showcases the complete system functionality, from service startup to workflow execution and monitoring.

---

## 🚀 **Pre-Demo Setup**

### **1. Environment Preparation**
```bash
# Ensure all services are stopped
docker-compose down

# Clear any existing data (optional)
docker volume prune -f

# Verify Docker is running
docker --version
docker-compose --version
```

### **2. Demo Data Preparation**
```bash
# Sample purchase request data
{
  "userId": "student_123",
  "productId": "ISBN_9780140283338",
  "quantity": 1,
  "amount": 89.99,
  "paymentMethod": "credit_card",
  "shippingAddress": "123 University Ave, College City, CA 90210"
}
```

---

## 🎬 **Demo Script - Step by Step**

### **Step 1: Introduction and System Overview (2 minutes)**

#### **Opening Statement**
"Good [morning/afternoon], today I'll be demonstrating the GlobalBooks ESB Orchestrator Service, a microservices-based system implementing Enterprise Service Bus patterns with BPEL workflow orchestration."

#### **System Architecture Overview**
"Let me start by showing you the system architecture. We have:
- **5 microservices**: Orders, Payment, Shipping, Catalog, and Orchestrator
- **RabbitMQ ESB**: For asynchronous message routing
- **Custom BPEL Engine**: For business process automation
- **MongoDB**: For data persistence
- **Docker**: For containerized deployment"

#### **Key Features Highlight**
"Key features include:
- **Workflow Orchestration**: Complete purchase order processing
- **Error Handling**: Dead letter queues and compensation logic
- **Security**: OAuth2 authentication with JWT tokens
- **Monitoring**: Real-time workflow tracking and metrics"

---

### **Step 2: Service Startup and Health Check (3 minutes)**

#### **Start All Services**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Show service status
docker-compose ps
```

#### **Verify Service Health**
"Let me verify that all services are running and healthy:"

```bash
# Check service logs
docker-compose logs --tail=10 orchestratorservice
docker-compose logs --tail=10 orders-service
docker-compose logs --tail=10 payment-service
docker-compose logs --tail=10 shipping-service
```

#### **Health Check Endpoints**
"Now let's verify each service is responding:"

```bash
# Test health endpoints
curl http://localhost:3003/health
curl http://localhost:3000/
curl http://localhost:3001/
curl http://localhost:3002/
curl http://localhost:8080/
```

**Demo Points:**
- Show Docker Compose starting all services
- Demonstrate service health monitoring
- Highlight container orchestration capabilities

---

### **Step 3: API Documentation and Swagger UI (2 minutes)**

#### **Access Swagger UI**
"Let me show you the comprehensive API documentation through Swagger UI:"

**Navigate to:** `http://localhost:3003/api-docs`

#### **API Documentation Walkthrough**
"Here you can see:
- **Purchase Section**: Complete workflow orchestration
- **Workflow Section**: BPEL workflow management
- **Configuration Section**: ESB and workflow settings
- **Health Section**: System monitoring endpoints"

#### **Interactive API Testing**
"Let me demonstrate the interactive testing capabilities:"

1. **Expand POST /purchase endpoint**
2. **Click "Try it out"**
3. **Show the request schema and examples**
4. **Highlight the comprehensive documentation**

**Demo Points:**
- Show professional API documentation
- Demonstrate interactive testing capabilities
- Highlight OpenAPI 3.0 compliance

---

### **Step 4: RabbitMQ Management Interface (2 minutes)**

#### **Access RabbitMQ Management**
**Navigate to:** `http://localhost:15672`
- **Username**: `guest`
- **Password**: `guest`

#### **Queue Overview**
"Here you can see our ESB configuration:
- **Command Queues**: For service communication
- **Event Queues**: For workflow monitoring
- **Dead Letter Queue**: For failed message handling
- **Retry Queue**: For automatic retry mechanisms"

#### **Queue Details**
"Let me show you the specific queue configurations:"

1. **Click on "Queues" tab**
2. **Show queue depths and message counts**
3. **Highlight routing keys and exchanges**
4. **Demonstrate queue monitoring capabilities**

**Demo Points:**
- Show enterprise-grade message broker
- Demonstrate queue monitoring and management
- Highlight ESB pattern implementation

---

### **Step 5: Complete Purchase Workflow Execution (5 minutes)**

#### **Initiate Purchase Workflow**
"Now let's execute a complete purchase workflow to demonstrate the BPEL engine in action:"

```bash
# Execute purchase workflow
curl -X POST http://localhost:3003/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student_123",
    "productId": "ISBN_9780140283338",
    "quantity": 1,
    "amount": 89.99,
    "paymentMethod": "credit_card",
    "shippingAddress": "123 University Ave, College City, CA 90210"
  }'
```

#### **Workflow Execution Monitoring**
"Let's monitor the workflow execution in real-time:"

```bash
# Get workflow status
curl http://localhost:3003/workflows

# Get specific workflow details
curl http://localhost:3003/workflow/{workflowId}
```

#### **Real-time Status Updates**
"Watch the workflow progress through each step:
1. **INITIATED**: Workflow started
2. **ORDER_CREATED**: Order service processed
3. **PAYMENT_PROCESSED**: Payment service completed
4. **SHIPPING_CREATED**: Shipping service arranged
5. **COMPLETED**: Workflow successful"

**Demo Points:**
- Show BPEL workflow execution
- Demonstrate real-time monitoring
- Highlight step-by-step progression
- Show successful completion

---

### **Step 6: Error Handling and Compensation (3 minutes)**

#### **Simulate Error Scenario**
"Now let me demonstrate the robust error handling and compensation logic:"

```bash
# Stop a service to simulate failure
docker-compose stop payment-service

# Try to execute another purchase workflow
curl -X POST http://localhost:3003/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student_456",
    "productId": "ISBN_9780061120084",
    "quantity": 2,
    "amount": 29.98,
    "paymentMethod": "debit_card",
    "shippingAddress": "456 College Blvd, University Town, CA 90211"
  }'
```

#### **Show Error Handling**
"Notice how the system handles the failure:
- **Automatic retry**: 3 attempts with exponential backoff
- **Compensation logic**: Automatic rollback of completed steps
- **Dead letter queue**: Failed messages captured for analysis
- **Workflow state**: Properly tracked and managed"

#### **Restart Service and Recovery**
```bash
# Restart the payment service
docker-compose start payment-service

# Show recovery and successful execution
curl http://localhost:3003/workflows
```

**Demo Points:**
- Demonstrate fault tolerance
- Show automatic recovery mechanisms
- Highlight compensation logic
- Prove system resilience

---

### **Step 7: Performance Monitoring and Metrics (2 minutes)**

#### **Workflow Performance Metrics**
"Let's examine the performance metrics and SLA compliance:"

```bash
# Get workflow definition and configuration
curl http://localhost:3003/workflow-definition

# Get ESB configuration
curl http://localhost:3003/esb-config

# Get system health status
curl http://localhost:3003/health
```

#### **SLA Compliance Demonstration**
"Here you can see our SLA commitments:
- **Response Time**: ≤ 30 seconds per step
- **Retry Attempts**: Maximum 3 per step
- **Compensation Timeout**: ≤ 15 seconds
- **Overall Workflow**: ≤ 120 seconds"

#### **Performance Analysis**
"Let's analyze the actual performance:
- **Step execution times**: Real vs. committed
- **Retry statistics**: Success rate and patterns
- **Error rates**: System reliability metrics
- **Throughput**: Requests processed per second"

**Demo Points:**
- Show SLA monitoring capabilities
- Demonstrate performance tracking
- Highlight governance framework
- Prove measurable commitments

---

### **Step 8: Advanced Features and Capabilities (2 minutes)**

#### **OAuth2 Authentication**
"Let me demonstrate the enterprise-grade security:"

```bash
# Show OAuth2 endpoints
curl http://localhost:3003/oauth2/client-token

# Demonstrate token generation
# (Use the token generation tools from token-Gen folder)
```

#### **Service-to-Service Communication**
"Here's how services communicate securely:"

```bash
# Show service communication patterns
# Demonstrate message routing through RabbitMQ
# Highlight correlation ID tracking
```

#### **Workflow State Management**
"Let's examine the comprehensive workflow state tracking:"

```bash
# Get detailed workflow information
curl http://localhost:3003/workflow/{workflowId}

# Show workflow history and compensation actions
# Demonstrate state transition logging
```

**Demo Points:**
- Show enterprise security features
- Demonstrate service communication
- Highlight workflow management
- Prove production readiness

---

### **Step 9: System Monitoring and Observability (2 minutes)**

#### **Real-time Monitoring Dashboard**
"Let me show you the comprehensive monitoring capabilities:"

1. **Service Health Dashboard**
2. **Queue Depth Monitoring**
3. **Workflow Execution Tracking**
4. **Performance Metrics Display**

#### **Log Analysis and Debugging**
"Here's how we monitor and debug the distributed system:"

```bash
# Show real-time logs
docker-compose logs -f orchestratorservice

# Demonstrate log correlation
# Show debugging capabilities
```

#### **Alerting and Notifications**
"System provides proactive monitoring:
- **SLA violation alerts**
- **Performance degradation warnings**
- **Error rate notifications**
- **Capacity planning insights**"

**Demo Points:**
- Show comprehensive monitoring
- Demonstrate debugging capabilities
- Highlight operational excellence
- Prove enterprise readiness

---

### **Step 10: Demo Summary and Q&A (2 minutes)**

#### **Demo Summary**
"Let me summarize what we've demonstrated:
- ✅ **Service Architecture**: 5 microservices with ESB pattern
- ✅ **Workflow Orchestration**: BPEL engine with compensation logic
- ✅ **Error Handling**: Robust retry and recovery mechanisms
- ✅ **Security**: OAuth2 authentication and authorization
- ✅ **Monitoring**: Real-time performance and SLA tracking
- ✅ **Documentation**: Comprehensive API documentation
- ✅ **Deployment**: Containerized with Docker Compose"

#### **Key Achievements Highlight**
"Key achievements include:
- **Production-ready architecture**: Enterprise-grade patterns
- **Comprehensive testing**: Error scenarios and recovery
- **Performance compliance**: SLA commitments met
- **Security implementation**: Industry-standard authentication
- **Operational excellence**: Monitoring and observability"

#### **Q&A Preparation**
"Now I'm ready to answer your questions about:
- Architecture design decisions
- Technology choices and alternatives
- Implementation challenges and solutions
- Performance and scalability considerations
- Security and compliance aspects
- Future development plans"

---

## 🎯 **Demo Success Criteria**

### **Technical Demonstration**
- ✅ All services start successfully
- ✅ Complete workflow execution in < 2 minutes
- ✅ Error handling and recovery demonstration
- ✅ Real-time monitoring and metrics
- ✅ Security features working correctly

### **Presentation Quality**
- ✅ Clear explanation of architecture
- ✅ Smooth demonstration flow
- ✅ Professional presentation style
- ✅ Comprehensive coverage of features
- ✅ Effective Q&A handling

### **System Performance**
- ✅ Response times within SLA commitments
- ✅ Error rates below 0.1%
- ✅ Successful workflow completion
- ✅ Proper error handling and compensation
- ✅ Real-time status updates

---

## 🚨 **Demo Troubleshooting Guide**

### **Common Issues and Solutions**

#### **Service Startup Issues**
```bash
# Check Docker status
docker system info

# Verify ports availability
netstat -an | grep :3000
netstat -an | grep :3001
netstat -an | grep :3002
netstat -an | grep :3003

# Restart specific service
docker-compose restart orchestratorservice
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose logs mongo

# Verify MongoDB connectivity
docker exec -it soadb mongosh
```

#### **RabbitMQ Issues**
```bash
# Check RabbitMQ status
docker-compose logs rabbitmq

# Verify RabbitMQ connectivity
docker exec -it soarbmq rabbitmq-diagnostics -q ping
```

#### **Workflow Execution Issues**
```bash
# Check workflow engine logs
docker-compose logs orchestratorservice

# Verify service communication
docker-compose logs orders-service
docker-compose logs payment-service
docker-compose logs shipping-service
```

---

## 📚 **Demo Resources and References**

### **Quick Reference Commands**
```bash
# Service management
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # Follow logs
docker-compose ps             # Service status

# Health checks
curl http://localhost:3003/health
curl http://localhost:3000/
curl http://localhost:3001/
curl http://localhost:3002/

# Workflow execution
curl -X POST http://localhost:3003/purchase -H "Content-Type: application/json" -d '{...}'
curl http://localhost:3003/workflows
curl http://localhost:3003/workflow/{id}
```

### **Key URLs for Demo**
- **Swagger UI**: http://localhost:3003/api-docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **ESB Orchestrator**: http://localhost:3003
- **Orders Service**: http://localhost:3000
- **Payment Service**: http://localhost:3001
- **Shipping Service**: http://localhost:3002
- **Catalog Service**: http://localhost:8080

### **Demo Data Examples**
```json
// Sample purchase request
{
  "userId": "student_123",
  "productId": "ISBN_9780140283338",
  "quantity": 1,
  "amount": 89.99,
  "paymentMethod": "credit_card",
  "shippingAddress": "123 University Ave, College City, CA 90210"
}

// Alternative request
{
  "userId": "student_456",
  "productId": "ISBN_9780061120084",
  "quantity": 2,
  "amount": 29.98,
  "paymentMethod": "debit_card",
  "shippingAddress": "456 College Blvd, University Town, CA 90211"
}
```

---

**🎯 This demo script provides a comprehensive guide for demonstrating the GlobalBooks ESB Orchestrator Service, ensuring a professional and thorough presentation that showcases all key features and capabilities.**
