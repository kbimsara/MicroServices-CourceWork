const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const {
  createOrder,
  getOrders,
  updateStatus,
  deleteOrder,
} = require("../controllers/ordersController");

// Apply JWT middleware to all /orders routes
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
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/", getOrders);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/status", updateStatus);

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:orderId", deleteOrder);

module.exports = router;
