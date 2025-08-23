# Viva Presentation Slides - Outline

**Slide 1: Title Slide**
*   **Title:** CCS3341 SOA & Microservices Coursework Presentation: GlobalBooks Inc.
*   **Your Name**
*   **Student ID**
*   **Module Code & Title**
*   **Date**

**Slide 2: Coursework Overview & Objectives**
*   Briefly state the coursework goal: Transform monolithic system to SOA with microservices.
*   Highlight key learning outcomes addressed (ILO1-ILO4).
*   Mention the business scenario: GlobalBooks Inc. challenges & target architecture.

**Slide 3: Legacy System Challenges**
*   Briefly explain the problems with the monolithic Java system (performance, deployment bottlenecks).

**Slide 4: Target Architecture Overview**
*   **Diagram:** (Conceptual diagram showing the four services, RabbitMQ, and external interfaces).
*   Key components: Catalog, Orders, Payments, Shipping services.
*   Dual Interfaces: SOAP + REST.
*   Asynchronous Messaging: RabbitMQ.
*   Service Discovery: UDDI (conceptual).
*   Orchestration: BPEL (conceptual).
*   Security: WS-Security + Simplified JWT (OAuth2).

**Slide 5: Service Decomposition & Design Principles**
*   How the monolith was decomposed (based on business capabilities).
*   Examples of SOA principles applied: Loose Coupling, Autonomy, Reusability.
*   *Key Takeaway:* Services are independently deployable and scalable.

**Slide 6: Service Implementations - Overview**
*   Briefly mention technology stacks:
    *   CatalogService: Java (SOAP), Spring Boot (REST)
    *   Orders, Payments, Shipping: Node.js (REST & SOAP)
*   Database: MongoDB for Node.js services, in-memory for CatalogService (demo).

**Slide 7: Deep Dive: CatalogService**
*   **SOAP Interface:**
    *   WSDL: `CatalogService.wsdl` (key operations, data types).
    *   Implementation: Java, JAX-WS, Apache CXF.
    *   WS-Security: UsernameToken (`ServerPasswordCallback`).
*   **REST Interface:**
    *   Endpoints: `/api/products` (GET, POST).
    *   Implementation: Spring Boot, `ProductController`.
    *   Authentication: Simplified JWT (`JwtAuthFilter`, `AuthController`).
*   *Trade-off:* Java for existing codebase, simplified JWT for coursework.

**Slide 8: Deep Dive: Orders, Payments, Shipping Services**
*   **REST Interfaces:**
    *   Endpoints: `/orders`, `/payments`, `/shipments` (CRUD operations).
    *   Implementation: Node.js, Express.js, Mongoose (MongoDB).
    *   Authentication: Simplified JWT (`express-jwt`).
*   **SOAP Interfaces:**
    *   WSDLs: (`OrdersService.wsdl`, etc.)
    *   Implementation: Node.js, `node-soap` library.
*   *Trade-off:* Node.js for consistency, simplified JWT for coursework.

**Slide 9: Integration & Messaging (RabbitMQ)**
*   **Role:** ESB for asynchronous communication.
*   **Mechanism:** Publish-Subscribe model.
*   **Examples:** `payment.created`, `shipping.statusUpdated`, `order-events` queues.
*   **Benefits:** Decoupling, Scalability, Resilience.
*   *Trade-off:* RabbitMQ chosen for maturity, compared to direct HTTP calls.

**Slide 10: Service Discovery (UDDI - Conceptual)**
*   **Role of UDDI:** Centralized registry for publishing/discovering service endpoints.
*   **Conceptual Integration:** How services would register and clients would discover.
*   **Justification for Documented Approach:** Time/resource constraints.
*   *Key Takeaway:* Understanding of dynamic service lookup.

**Slide 11: Orchestration (BPEL Engine - Conceptual)**
*   **"PlaceOrder" Workflow:** (Steps: Create Order -> Process Payment -> Initiate Shipment -> Update Status).
*   **BPEL Engine Role (Conceptual):** Managing workflow state, fault handling.
*   **Justification for Documented Approach:** Complexity, coursework focus.
*   *Trade-off:* Orchestration vs. Choreography.

**Slide 12: Quality & Governance**
*   **QoS Mechanisms:** Reliable messaging, fault isolation, scalability.
*   **Governance Policy:**
    *   Versioning (conceptual).
    *   SLAs: 99.5% uptime, <200ms response times (how they would be monitored).
    *   Deprecation strategy (conceptual).
*   *Key Takeaway:* Importance of defining policies even if not fully automated.

**Slide 13: Cloud Deployment**
*   **Approach:** Docker & `docker-compose` for local orchestration.
*   **Future Cloud Platform:** Discuss considerations for deploying to a real cloud (VMs, container services, environment vars, persistent storage, networking, monitoring).
*   *Key Takeaway:* Portable containerized solution.

**Slide 14: Testing Suites**
*   **SOAP UI Projects:**
    *   For each SOAP service (Catalog, Orders, Payments, Shipping).
    *   Test cases for CRUD, assertions, WS-Security for CatalogService.
*   **Postman/cURL Scripts:**
    *   For each REST API (Auth, CRUD).
    *   JWT authorization.
*   *Key Takeaway:* Verification of dual interfaces and security.

**Slide 15: Conclusion & Future Enhancements**
*   **Summary:** Project achievements, alignment with coursework.
*   **Challenges:** Technical integration, balancing requirements with constraints.
*   **Future Enhancements:** (List key areas like dedicated auth service, full UDDI/BPEL, API Gateway, advanced error handling, tracing, monitoring).

**Slide 16: Q&A**
*   Thank you slide.
