const express = require('express');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel;
const pendingRequests = new Map(); // To store pending requests and their responses

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Orchestrator connected to RabbitMQ');

        // Assert queues for commands to other services
        await channel.assertQueue('order.create.command', { durable: true });
        await channel.assertQueue('payment.create.command', { durable: true });
        await channel.assertQueue('shipping.create.command', { durable: true });
        await channel.assertQueue('order.update.command', { durable: true });

        // Assert a temporary queue for replies from other services
        const q = await channel.assertQueue('', { exclusive: true });
        const replyQueue = q.queue;

        channel.consume(replyQueue, (msg) => {
            const { correlationId, status, data, error } = JSON.parse(msg.content.toString());
            if (pendingRequests.has(correlationId)) {
                const { resolve, reject, step } = pendingRequests.get(correlationId);
                if (error) {
                    reject({ step, error });
                } else {
                    resolve({ step, data });
                }
                // For simplicity, remove after first reply. For multi-step replies, adjust logic.
                pendingRequests.delete(correlationId);
            }
        }, { noAck: true });

        return replyQueue;

    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

// Orchestration logic
async function orchestratePurchaseOrder(orderRequest, replyQueue) {
    const correlationId = uuidv4();

    return new Promise(async (resolve, reject) => {
        pendingRequests.set(correlationId, { resolve, reject, step: 'init' });

        try {
            // Step 1: Create Order
            console.log(`Orchestrator: Sending create order command for correlationId: ${correlationId}`);
            await channel.sendToQueue(
                'order.create.command',
                Buffer.from(JSON.stringify({ ...orderRequest, correlationId, replyTo: replyQueue })),
                { correlationId, replyTo: replyQueue }
            );
            const orderResponse = await new Promise((res, rej) => pendingRequests.set(correlationId, { resolve: res, reject: rej, step: 'createOrder' }));

            if (orderResponse.error) throw new Error(`Order creation failed: ${orderResponse.error}`);
            const orderId = orderResponse.data.orderId;
            console.log(`Orchestrator: Order created with ID: ${orderId}`);

            // Step 2: Process Payment
            console.log(`Orchestrator: Sending create payment command for orderId: ${orderId}`);
            const paymentCommand = {
                orderId,
                userId: orderRequest.userId,
                amount: orderRequest.amount,
                method: orderRequest.paymentMethod,
                correlationId,
                replyTo: replyQueue
            };
            await channel.sendToQueue(
                'payment.create.command',
                Buffer.from(JSON.stringify(paymentCommand)),
                { correlationId, replyTo: replyQueue }
            );
            const paymentResponse = await new Promise((res, rej) => pendingRequests.set(correlationId, { resolve: res, reject: rej, step: 'createPayment' }));

            if (paymentResponse.error) throw new Error(`Payment processing failed: ${paymentResponse.error}`);
            const paymentId = paymentResponse.data.paymentId;
            console.log(`Orchestrator: Payment processed with ID: ${paymentId}`);

            // Step 3: Create Shipping
            console.log(`Orchestrator: Sending create shipping command for orderId: ${orderId}`);
            const shippingCommand = {
                orderId,
                userId: orderRequest.userId,
                address: orderRequest.shippingAddress,
                correlationId,
                replyTo: replyQueue
            };
            await channel.sendToQueue(
                'shipping.create.command',
                Buffer.from(JSON.stringify(shippingCommand)),
                { correlationId, replyTo: replyQueue }
            );
            const shippingResponse = await new Promise((res, rej) => pendingRequests.set(correlationId, { resolve: res, reject: rej, step: 'createShipping' }));

            if (shippingResponse.error) throw new Error(`Shipping creation failed: ${shippingResponse.error}`);
            const shipmentId = shippingResponse.data.shipmentId;
            console.log(`Orchestrator: Shipment created with ID: ${shipmentId}`);

            // Step 4: Update Order Status to Completed (or similar)
            console.log(`Orchestrator: Sending update order status command for orderId: ${orderId}`);
            const updateOrderCommand = {
                orderId,
                status: 'completed',
                correlationId,
                replyTo: replyQueue
            };
            await channel.sendToQueue(
                'order.update.command',
                Buffer.from(JSON.stringify(updateOrderCommand)),
                { correlationId, replyTo: replyQueue }
            );
            const updateOrderResponse = await new Promise((res, rej) => pendingRequests.set(correlationId, { resolve: res, reject: rej, step: 'updateOrderStatus' }));

            if (updateOrderResponse.error) throw new Error(`Order status update failed: ${updateOrderResponse.error}`);
            console.log(`Orchestrator: Order ${orderId} status updated to completed.`);

            resolve({ orderId, status: 'SUCCESS', message: 'Purchase order processed successfully.' });

        } catch (error) {
            console.error(`Orchestrator: Orchestration failed for correlationId ${correlationId}:`, error.message);
            // Implement compensation/rollback logic here if needed
            reject({ status: 'FAILED', message: `Purchase order failed: ${error.message}` });
        } finally {
            // Clean up the pending request, especially if it was a final step or an error occurred
            pendingRequests.delete(correlationId);
        }
    });
}

// REST endpoint to initiate purchase order
app.post('/purchase', async (req, res) => {
    const { productId, quantity, userId, amount, shippingAddress, paymentMethod } = req.body;

    if (!productId || !quantity || !userId || !amount || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Connect to RabbitMQ and get replyQueue if not already connected
        const replyQueue = await connectRabbitMQ();

        const result = await orchestratePurchaseOrder(req.body, replyQueue);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error initiating purchase order:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Start server and connect to RabbitMQ
app.listen(PORT, async () => {
    console.log(`Orchestrator Service running on port ${PORT}`);
    await connectRabbitMQ();
});
