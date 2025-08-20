const express = require('express');
const router = express.Router();
const checkJwt = require('../middleware/auth');
const { createOrder, getOrders, updateStatus, deleteOrder } = require('../controllers/ordersController');

router.use(checkJwt);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *               - amount
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64f8c0a2e3d4b12abc123456"
 *               productId:
 *                 type: string
 *                 example: "64f8c0b3e3d4b12abc654321"
 *               amount:
 *                 type: number
 *                 example: 150.5
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f9d1f5e3d4b12abc987654"
 *               userId: "64f8c0a2e3d4b12abc123456"
 *               productId: "64f8c0b3e3d4b12abc654321"
 *               amount: 150.5
 *               quantity: 2
 *               status: "pending"
 *               createdAt: "2025-08-20T15:00:00.000Z"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64f9d1f5e3d4b12abc987654"
 *                 userId: "64f8c0a2e3d4b12abc123456"
 *                 productId: "64f8c0b3e3d4b12abc654321"
 *                 amount: 150.5
 *                 quantity: 2
 *                 status: "pending"
 *                 createdAt: "2025-08-20T15:00:00.000Z"
 */

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f9d1f5e3d4b12abc987654"
 *               userId: "64f8c0a2e3d4b12abc123456"
 *               productId: "64f8c0b3e3d4b12abc654321"
 *               amount: 150.5
 *               quantity: 2
 *               status: "completed"
 *               createdAt: "2025-08-20T15:00:00.000Z"
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Order deleted successfully"
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});


module.exports = router;
