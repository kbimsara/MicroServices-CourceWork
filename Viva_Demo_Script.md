# Viva Demo Script - Outline

**1. Introduction (2-3 minutes)**
*   Briefly introduce yourself and the coursework.
*   State the problem: GlobalBooks Inc. legacy monolith.
*   Present the solution: SOA with microservices, dual interfaces.
*   Outline what you will demo: Each service's REST & SOAP APIs, RabbitMQ communication, and testing.

**2. Setup & Environment (1-2 minutes)**
*   Explain the `docker-compose.yml`:
    *   Show `docker-compose.yml` file.
    *   Point out the services: Catalog, Orders, Payments, Shipping, MongoDB, RabbitMQ.
    *   Explain how they are containerized and interconnected.
*   **Action:** Briefly show `docker-compose.yml` and explain the services.
*   **Action:** Run `docker-compose up -d` (if not already running) to start all services. Verify all containers are up and running (`docker ps`).

**3. CatalogService Demo (3-4 minutes)**
*   **Purpose:** Showcases dual interface (SOAP & REST) and WS-Security for SOAP, simplified JWT for REST.
*   **REST API Demo (using cURL/Postman):**
    *   **Action:** Get JWT Token for `CatalogService` using the provided cURL command (from `CatalogService_REST_cURL_Commands.md`). Explain the `user` and `password`.
    *   **Action:** Use the obtained token to `GET /api/products` (all products). Show the response.
    *   **Action:** `GET /api/products/{id}` (single product). Show the response.
    *   **Action:** `POST /api/products` (create a new product). Show the request body and successful response.
    *   Explain the simplified JWT authentication.
*   **SOAP API Demo (using SOAP UI):**
    *   **Action:** Open `CatalogService_SoapUI_Project.xml` in SoapUI.
    *   **Action:** Execute the `getProductById` request. Show the request with WS-Security UsernameToken header (`clientuser`, `clientpass`). Show the response and passed assertions.
    *   **Action:** Execute the `getAllProducts` request. Show the response and passed assertions.
    *   Explain WS-Security.

**4. OrdersService Demo (3-4 minutes)**
*   **Purpose:** Showcases dual interface (REST & SOAP) and RabbitMQ consumption for order status updates.
*   **REST API Demo (using cURL/Postman):**
    *   **Action:** (Mention using a placeholder JWT token for Node.js services, signed with `JWT_SECRET`).
    *   **Action:** `POST /orders` (create a new order). Note down the `_id` from the response.
    *   **Action:** `GET /orders/{id}` (get the newly created order). Show the response.
    *   **Action:** `PATCH /orders/{id}/status` (update status to `completed`). Show the response.
*   **SOAP API Demo (using SOAP UI):**
    *   **Action:** Open `OrdersService_SoapUI_Project.xml` in SoapUI.
    *   **Action:** Execute `createOrder` (use new user/product IDs). Note the `_id`.
    *   **Action:** Execute `getOrderById` using the new `_id`. Show response.
    *   **Action:** Execute `updateOrderStatus` using the new `_id` and a new status. Show response.
    *   **Action:** Execute `deleteOrder` using the new `_id`. Show success response.
*   **RabbitMQ Integration:**
    *   **Action:** Briefly show `OrdersService/index.js` and `OrdersService/utils/rabbitmq.js` to highlight the consumer setup for `order-events`.
    *   **Explain:** How the Orders service would react to events (e.g., from Payments/Shipping) to update order statuses.

**5. PaymentService Demo (3-4 minutes)**
*   **Purpose:** Showcases dual interface (REST & SOAP) and RabbitMQ publishing for `payment.created` events.
*   **REST API Demo (using cURL/Postman):**
    *   **Action:** `POST /payments` (create a new payment for an `orderId` from OrdersService demo). Note down the `_id`.
    *   **Action:** `GET /payments/{id}`. Show response.
    *   **Action:** `PATCH /payments/{id}/status` (update status to `completed`). Show response.
    *   **Explain:** How this action would trigger a `payment.statusUpdated` event published to RabbitMQ.
*   **SOAP API Demo (using SOAP UI):**
    *   **Action:** Open `PaymentService_SoapUI_Project.xml` in SoapUI.
    *   **Action:** Execute `createPayment`. Note the `_id`.
    *   **Action:** Execute `getPaymentById` using the new `_id`. Show response.
    *   **Action:** Execute `updatePaymentStatus` using the new `_id`. Show response.
*   **RabbitMQ Integration:**
    *   **Action:** Briefly show `PaymentService/controllers/paymentsController.js` to show the `publish("payment.created", payment)` line.
    *   **Explain:** How the PaymentService publishes events for other services to consume.

**6. ShippingService Demo (3-4 minutes)**
*   **Purpose:** Showcases dual interface (REST & SOAP) and RabbitMQ publishing for `shipping.created` events.
*   **REST API Demo (using cURL/Postman):**
    *   **Action:** `POST /shipments` (create a new shipment for an `orderId` from OrdersService demo). Note down the `_id`.
    *   **Action:** `GET /shipments/{id}`. Show response.
    *   **Action:** `PATCH /shipments/{id}/status` (update status to `shipped`). Show response.
    *   **Explain:** How this action would trigger a `shipping.statusUpdated` event published to RabbitMQ.
*   **SOAP API Demo (using SOAP UI):**
    *   **Action:** Open `ShippingService_SoapUI_Project.xml` in SoapUI.
    *   **Action:** Execute `createShipping`. Note the `_id`.
    *   **Action:** Execute `getShippingById` using the new `_id`. Show response.
    *   **Action:** Execute `updateShippingStatus` using the new `_id`. Show response.

**7. Cross-Cutting Concerns (Conceptual Discussion) (2-3 minutes)**
*   **Service Discovery (UDDI):** Refer to your `Reflective_Report.md`. Explain the concept of UDDI, why it's important, and how it would conceptually fit into this architecture (publish/discover endpoints). Mention the trade-offs of not implementing it fully.
*   **Orchestration (BPEL):** Refer to your `Reflective_Report.md`. Explain the "PlaceOrder" workflow conceptually and how a BPEL engine would orchestrate it. Mention the trade-offs of the documented approach vs. choreography.
*   **Governance:** Briefly mention SLAs (99.5% uptime, <200ms response times) and how they would be monitored and enforced.
*   **Cloud Deployment:** Briefly discuss the Docker-compose based deployment and future considerations for a real cloud environment (environment variables, persistent storage, networking, monitoring).

**8. Q&A / Conclusion (2-3 minutes)**
*   Summarize key achievements and how the project meets the coursework objectives.
*   Open for questions.

**Tips for Demo:**
*   **Practice:** Rehearse the demo multiple times to ensure a smooth flow.
*   **Preparation:** Have all cURL commands and SoapUI projects open and ready.
*   **Network:** Ensure your Docker containers are running and accessible.
*   **Troubleshooting:** Be prepared for minor issues; calmly address them.
*   **Time Management:** Stick to the time limits for each section.
*   **Enthusiasm:** Show your understanding and passion for the subject.
