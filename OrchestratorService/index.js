const express = require('express');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const ESB_CONFIG = require('./esb-config');
const BPELWorkflowEngine = require('./bpel-workflow-engine');
const PlaceOrderWorkflow = require('./placeorder-workflow');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const PORT = 3003;

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ESB Orchestrator Service API',
            version: '2.0.0',
            description: 'ESB Orchestrator Service with BPEL Workflow Engine for GlobalBooks Microservices',
            contact: {
                name: 'GlobalBooks Team',
                email: 'support@globalbooks.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3003',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                PurchaseRequest: {
                    type: 'object',
                    required: ['userId', 'productId', 'quantity', 'amount', 'shippingAddress', 'paymentMethod'],
                    properties: {
                        userId: {
                            type: 'string',
                            description: 'User ID for the purchase',
                            example: 'student_123'
                        },
                        productId: {
                            type: 'string',
                            description: 'Product ID (ISBN) for the book',
                            example: 'ISBN_9780140283338'
                        },
                        quantity: {
                            type: 'integer',
                            description: 'Quantity of books to purchase',
                            minimum: 1,
                            example: 1
                        },
                        amount: {
                            type: 'number',
                            description: 'Total amount for the purchase',
                            minimum: 0.01,
                            example: 89.99
                        },
                        shippingAddress: {
                            type: 'string',
                            description: 'Shipping address for delivery',
                            example: '123 University Ave, College City, CA 90210'
                        },
                        paymentMethod: {
                            type: 'string',
                            description: 'Payment method for the purchase',
                            enum: ['credit_card', 'paypal', 'bank_transfer'],
                            example: 'credit_card'
                        }
                    }
                },
                PurchaseResponse: {
                    type: 'object',
                    properties: {
                        workflowId: {
                            type: 'string',
                            description: 'Unique workflow ID for tracking',
                            example: 'd728aef2-1d75-4419-98a9-0f92db3df4cc'
                        },
                        status: {
                            type: 'string',
                            description: 'Workflow execution status',
                            enum: ['SUCCESS', 'FAILED'],
                            example: 'SUCCESS'
                        },
                        message: {
                            type: 'string',
                            description: 'Human-readable message about the workflow result',
                            example: 'Purchase order processed successfully'
                        },
                        orderId: {
                            type: 'string',
                            description: 'Generated order ID',
                            example: '68b1d8bdde0fd3ed24701f58'
                        },
                        paymentId: {
                            type: 'string',
                            description: 'Generated payment ID',
                            example: '68b1d8bdef8b0d4c7f1d5fb5'
                        },
                        shipmentId: {
                            type: 'string',
                            description: 'Generated shipment ID',
                            example: '68b1d8bd8429eafe7bc24052'
                        },
                        purchaseDetails: {
                            type: 'object',
                            description: 'Comprehensive purchase details including order, payment, and shipping information',
                            properties: {
                                order: {
                                    type: 'object',
                                    description: 'Complete order details'
                                },
                                payment: {
                                    type: 'object',
                                    description: 'Complete payment details'
                                },
                                shipping: {
                                    type: 'object',
                                    description: 'Complete shipping details'
                                }
                            }
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp when the response was generated',
                            example: '2025-08-29T16:43:41.443Z'
                        }
                    }
                },
                OrderDetails: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Order ID',
                            example: '68b1d8bdde0fd3ed24701f58'
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                            example: 'student_123'
                        },
                        productId: {
                            type: 'string',
                            description: 'Product ID (ISBN)',
                            example: 'ISBN_9780140283338'
                        },
                        amount: {
                            type: 'number',
                            description: 'Order amount',
                            example: 89.99
                        },
                        quantity: {
                            type: 'integer',
                            description: 'Quantity ordered',
                            example: 1
                        },
                        status: {
                            type: 'string',
                            description: 'Order status',
                            enum: ['pending', 'completed', 'cancelled'],
                            example: 'completed'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Order creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Order last update timestamp'
                        }
                    }
                },
                PaymentDetails: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Payment ID',
                            example: '68b1d8bdef8b0d4c7f1d5fb5'
                        },
                        orderId: {
                            type: 'string',
                            description: 'Associated order ID',
                            example: '68b1d8bdde0fd3ed24701f58'
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                            example: 'student_123'
                        },
                        amount: {
                            type: 'number',
                            description: 'Payment amount',
                            example: 89.99
                        },
                        method: {
                            type: 'string',
                            description: 'Payment method',
                            enum: ['credit_card', 'paypal', 'bank_transfer'],
                            example: 'credit_card'
                        },
                        status: {
                            type: 'string',
                            description: 'Payment status',
                            enum: ['pending', 'completed', 'failed'],
                            example: 'completed'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Payment creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Payment last update timestamp'
                        }
                    }
                },
                ShippingDetails: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Shipment ID',
                            example: '68b1d8bd8429eafe7bc24052'
                        },
                        orderId: {
                            type: 'string',
                            description: 'Associated order ID',
                            example: '68b1d8bdde0fd3ed24701f58'
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                            example: 'student_123'
                        },
                        address: {
                            type: 'string',
                            description: 'Shipping address',
                            example: '222 Comprehensive Street, Comprehensive City, CC 22222'
                        },
                        status: {
                            type: 'string',
                            description: 'Shipping status',
                            enum: ['pending', 'completed', 'cancelled'],
                            example: 'completed'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Shipment creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Shipment last update timestamp'
                        }
                    }
                }
            }
        }
    },
    apis: ['./index.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

// Hardcoded configuration - no environment dependencies
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';

let channel;
let replyQueue;
let bpelEngine;
let placeOrderWorkflow;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('ESB Orchestrator connected to RabbitMQ');

        // Declare ESB Exchange
        await channel.assertExchange(ESB_CONFIG.exchange.name, ESB_CONFIG.exchange.type, ESB_CONFIG.exchange.options);

        // Declare Dead Letter Exchange and Queue
        await channel.assertExchange(ESB_CONFIG.deadLetter.exchange, 'direct', { durable: true });
        await channel.assertQueue(ESB_CONFIG.deadLetter.queue, ESB_CONFIG.deadLetter.options);
        await channel.bindQueue(ESB_CONFIG.deadLetter.queue, ESB_CONFIG.deadLetter.exchange, 'dead.letter');

        // Declare Retry Queue
        await channel.assertQueue(ESB_CONFIG.retry.queue, ESB_CONFIG.retry.options);

        // Declare Command Queues with Dead Letter
        for (const [key, commandConfig] of Object.entries(ESB_CONFIG.commands)) {
            await channel.assertQueue(commandConfig.queue, commandConfig.options);
            await channel.bindQueue(commandConfig.queue, ESB_CONFIG.exchange.name, commandConfig.routingKey);
        }

        // Declare Event Queues
        for (const [key, eventConfig] of Object.entries(ESB_CONFIG.events)) {
            await channel.assertQueue(eventConfig.queue, eventConfig.options);
            await channel.bindQueue(eventConfig.queue, ESB_CONFIG.exchange.name, eventConfig.routingKey);
        }

        // Assert reply queue for orchestrator
        const replyQueueName = 'orchestrator_reply_queue_' + uuidv4();
        const q = await channel.assertQueue(replyQueueName, { 
            durable: false, 
            autoDelete: true,
            arguments: {
                'x-message-ttl': 300000 // 5 minutes
            }
        });
        replyQueue = q.queue;

        // Initialize BPEL Workflow Engine
        bpelEngine = new BPELWorkflowEngine(channel, replyQueue);
        placeOrderWorkflow = new PlaceOrderWorkflow(bpelEngine);

        // Setup reply consumer
        setupReplyConsumer();

        // Setup event consumers for workflow monitoring
        setupEventConsumers();

        console.log('ESB Configuration completed successfully');

    } catch (error) {
        console.error('Failed to connect to RabbitMQ ESB:', error);
        process.exit(1);
    }
}

// Setup reply consumer for workflow steps
function setupReplyConsumer() {
    channel.consume(replyQueue, async (msg) => {
        if (msg === null) return;
        
        try {
            const response = JSON.parse(msg.content.toString());
            console.log('ESB Orchestrator: Received reply message:', response);
            
            const { correlationId, data, error } = response;
            
            if (bpelEngine && correlationId) {
                // Convert the response format to what the BPEL engine expects
                const bpelResponse = {
                    data: data,
                    error: error
                };
                
                console.log('ESB Orchestrator: Processing reply for correlationId:', correlationId, 'with response:', bpelResponse);
                bpelEngine.processReply(correlationId, bpelResponse);
            } else {
                console.error('ESB Orchestrator: Invalid reply message format or missing correlationId:', response);
            }
            
        } catch (error) {
            console.error('Error processing reply message:', error);
        }
    }, { noAck: true });
}

// Setup event consumers for workflow monitoring
async function setupEventConsumers() {
    // Monitor order events
    await channel.consume(ESB_CONFIG.events.orderCreated.queue, async (msg) => {
        if (msg === null) return;
        try {
            const event = JSON.parse(msg.content.toString());
            console.log('ESB Event: Order Created:', event);
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing order event:', error);
            channel.nack(msg, false, false);
        }
    });

    // Monitor payment events
    await channel.consume(ESB_CONFIG.events.paymentProcessed.queue, async (msg) => {
        if (msg === null) return;
        try {
            const event = JSON.parse(msg.content.toString());
            console.log('ESB Event: Payment Processed:', event);
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing payment event:', error);
            channel.nack(msg, false, false);
        }
    });

    // Monitor shipping events
    await channel.consume(ESB_CONFIG.events.shippingCreated.queue, async (msg) => {
        if (msg === null) return;
        try {
            const event = JSON.parse(msg.content.toString());
            console.log('ESB Event: Shipping Created:', event);
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing shipping event:', error);
            channel.nack(msg, false, false);
        }
    });
}

// REST endpoint to initiate purchase order using BPEL workflow
/**
 * @swagger
 * /purchase:
 *   post:
 *     summary: Create a new purchase order using BPEL workflow
 *     description: Initiates a complete purchase workflow that creates an order, processes payment, and arranges shipping.
 *     tags: [Purchase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseRequest'
 *     responses:
 *       200:
 *         description: Purchase order processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseResponse'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error - workflow execution failed
 */
app.post('/purchase', async (req, res) => {
    console.log('ESB Orchestrator: Received purchase request:', req.body);
    
    const { productId, quantity, userId, amount, shippingAddress, paymentMethod } = req.body;
    
    if (!productId || !quantity || !userId || !amount || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Execute PlaceOrder BPEL workflow
        const result = await placeOrderWorkflow.execute(req.body);
        
        if (result.status === 'SUCCESS') {
            // Fetch comprehensive purchase details
            const purchaseDetails = await getPurchaseDetailsByOrderId(result.orderId);
            
            if (purchaseDetails.error) {
                console.error('Error fetching purchase details:', purchaseDetails.error);
                // Return workflow result if details fetch fails
                return res.status(200).json({
                    ...result,
                    warning: 'Workflow completed but details fetch failed',
                    purchaseDetails: null
                });
            }
            
            // Return comprehensive response with all details
            res.status(200).json({
                workflowId: result.workflowId,
                status: result.status,
                message: result.message,
                orderId: result.orderId,
                paymentId: result.paymentId,
                shipmentId: result.shipmentId,
                purchaseDetails: purchaseDetails,
                timestamp: new Date()
            });
        } else {
            // Workflow failed, return error
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('ESB Orchestrator: PlaceOrder workflow failed:', error);
        res.status(500).json({ 
            error: error.message || 'Internal Server Error',
            status: 'FAILED'
        });
    }
});

// REST endpoint to get workflow status
app.get('/workflow/:workflowId', (req, res) => {
    const { workflowId } = req.params;
    
    if (!bpelEngine) {
        return res.status(503).json({ error: 'BPEL Engine not initialized' });
    }
    
    const status = bpelEngine.getWorkflowStatus(workflowId);
    if (status) {
        res.status(200).json(status);
    } else {
        res.status(404).json({ error: 'Workflow not found' });
    }
});

// REST endpoint to get all workflows
/**
 * @swagger
 * /workflows:
 *   get:
 *     summary: Get all workflows
 *     description: Retrieves a list of all workflows and their current status
 *     tags: [Workflow]
 *     responses:
 *       200:
 *         description: List of all workflows retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   workflowId:
 *                     type: string
 *                     description: Workflow identifier
 *                   status:
 *                     type: string
 *                     description: Current workflow status
 *                     enum: [PENDING, RUNNING, SUCCESS, FAILED]
 *                   currentStep:
 *                     type: string
 *                     description: Current step being executed
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Workflow creation timestamp
 *       503:
 *         description: BPEL Engine not initialized
 */
app.get('/workflows', (req, res) => {
    if (!bpelEngine) {
        return res.status(503).json({ error: 'BPEL Engine not initialized' });
    }
    
    const workflows = bpelEngine.getAllWorkflows();
    res.status(200).json(workflows);
});

// REST endpoint to get workflow definition
app.get('/workflow-definition', (req, res) => {
    if (!placeOrderWorkflow) {
        return res.status(503).json({ error: 'PlaceOrder workflow not initialized' });
    }
    
    const definition = placeOrderWorkflow.getWorkflowDefinition();
    res.status(200).json(definition);
});

// REST endpoint to get ESB configuration
app.get('/esb-config', (req, res) => {
    res.status(200).json({
        exchange: ESB_CONFIG.exchange,
        queues: {
            commands: Object.keys(ESB_CONFIG.commands),
            events: Object.keys(ESB_CONFIG.events)
        },
        workflow: ESB_CONFIG.workflow
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date(),
        services: {
            rabbitmq: channel ? 'connected' : 'disconnected',
            bpelEngine: bpelEngine ? 'initialized' : 'not_initialized',
            placeOrderWorkflow: placeOrderWorkflow ? 'ready' : 'not_ready'
        }
    };
    
    res.status(200).json(health);
});

// REST endpoint to search purchase history by order ID
/**
 * @swagger
 * /purchase/order/{orderId}:
 *   get:
 *     summary: Get purchase details by order ID
 *     description: Retrieves comprehensive purchase details including order, payment, and shipping information for a specific order. This endpoint aggregates data from multiple microservices to provide a complete view of a purchase.
 *     tags: [Purchase]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order identifier (MongoDB ObjectId)
 *         example: "68b1d8e4de0fd3ed24701f5c"
 *     responses:
 *       200:
 *         description: Purchase details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: The order identifier that was requested
 *                   example: "68b1d8e4de0fd3ed24701f5c"
 *                 purchaseDetails:
 *                   type: object
 *                   description: Complete purchase information from all services
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/OrderDetails'
 *                     payment:
 *                       $ref: '#/components/schemas/PaymentDetails'
 *                     shipping:
 *                       $ref: '#/components/schemas/ShippingDetails'
 *             examples:
 *               successful_purchase:
 *                 summary: Successful Purchase Details
 *                 description: Complete purchase details returned for order 68b1d8e4de0fd3ed24701f5c
 *                 value:
 *                   orderId: "68b1d8e4de0fd3ed24701f5c"
 *                   purchaseDetails:
 *                     order:
 *                       _id: "68b1d8e4de0fd3ed24701f5c"
 *                       userId: "student_123"
 *                       productId: "ISBN_9780140283338"
 *                       amount: 89.99
 *                       quantity: 1
 *                       status: "completed"
 *                       createdAt: "2025-08-29T16:43:41.141Z"
 *                       updatedAt: "2025-08-29T16:43:41.327Z"
 *                     payment:
 *                       _id: "68b1d8bdef8b0d4c7f1d5fb5"
 *                       orderId: "68b1d8e4de0fd3ed24701f5c"
 *                       userId: "student_123"
 *                       amount: 89.99
 *                       method: "credit_card"
 *                       status: "completed"
 *                       createdAt: "2025-08-29T16:43:41.209Z"
 *                       updatedAt: "2025-08-29T16:43:41.344Z"
 *                     shipping:
 *                       _id: "68b1d8bd8429eafe7bc24052"
 *                       orderId: "68b1d8e4de0fd3ed24701f5c"
 *                       userId: "student_123"
 *                       address: "123 University Ave, College City, CA 90210"
 *                       status: "completed"
 *                       createdAt: "2025-08-29T16:43:41.266Z"
 *                       updatedAt: "2025-08-29T16:43:41.355Z"
 *       400:
 *         description: Bad request - missing or invalid order ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order ID is required"
 *       404:
 *         description: Purchase details not found for the specified order ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch order: Not Found"
 *       500:
 *         description: Internal server error - failed to fetch purchase details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch purchase details"
 *                 details:
 *                   type: string
 *                   example: "Network error connecting to orders service"
 */
app.get('/purchase/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    
    if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        // Fetch comprehensive purchase details by order ID
        const purchaseDetails = await getPurchaseDetailsByOrderId(orderId);
        
        if (purchaseDetails.error) {
            return res.status(404).json({ error: purchaseDetails.error });
        }
        
        res.status(200).json({
            orderId: orderId,
            purchaseDetails: purchaseDetails
        });
    } catch (error) {
        console.error('Error fetching purchase details by order ID:', error);
        res.status(500).json({ 
            error: 'Failed to fetch purchase details',
            details: error.message
        });
    }
});

// Function to fetch order details from Orders service
async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`http://orders-service:3000/orders/${orderId}`);
        if (response.ok) {
            return await response.json();
        } else {
            return { error: `Failed to fetch order: ${response.statusText}` };
        }
    } catch (error) {
        return { error: `Error fetching order: ${error.message}` };
    }
}

// Function to fetch payment by order ID
async function fetchPaymentByOrderId(orderId) {
    try {
        const response = await fetch(`http://payment-service:3001/payments/order/${orderId}`);
        if (response.ok) {
            return await response.json();
        } else {
            return { error: `Failed to fetch payment: ${response.statusText}` };
        }
    } catch (error) {
        return { error: `Error fetching payment: ${error.message}` };
    }
}

// Function to fetch shipping by order ID
async function fetchShippingByOrderId(orderId) {
    try {
        const response = await fetch(`http://shipping-service:3002/shipments/order/${orderId}`);
        if (response.ok) {
            return await response.json();
        } else {
            return { error: `Error fetching shipping: ${response.statusText}` };
        }
    } catch (error) {
        return { error: `Error fetching shipping: ${error.message}` };
    }
}

// Function to fetch purchase details by order ID
async function getPurchaseDetailsByOrderId(orderId) {
    try {
        // Fetch order details
        const orderDetails = await fetchOrderDetails(orderId);
        if (orderDetails.error) {
            return { error: orderDetails.error };
        }
        
        // Fetch payment details by order ID
        const paymentDetails = await fetchPaymentByOrderId(orderId);
        
        // Fetch shipping details by order ID
        const shippingDetails = await fetchShippingByOrderId(orderId);
        
        return {
            order: orderDetails,
            payment: paymentDetails,
            shipping: shippingDetails
        };
    } catch (error) {
        console.error('Error fetching purchase details by order ID:', error);
        return {
            error: 'Failed to fetch purchase details',
            details: error.message
        };
    }
}

// Start server and connect to RabbitMQ
app.listen(PORT, async () => {
    console.log(`ESB Orchestrator Service running on port ${PORT}`);
    await connectRabbitMQ();
    
    // Schedule cleanup of completed workflows
    setInterval(() => {
        if (bpelEngine) {
            const cleaned = bpelEngine.cleanupCompletedWorkflows();
            if (cleaned > 0) {
                console.log(`ESB Orchestrator: Cleaned up ${cleaned} completed workflows`);
            }
        }
    }, 60 * 60 * 1000); // Every hour
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('ESB Orchestrator: Shutting down gracefully...');
    
    if (channel) {
        await channel.close();
    }
    
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('ESB Orchestrator: Shutting down gracefully...');
    
    if (channel) {
        await channel.close();
    }
    
    process.exit(0);
});
