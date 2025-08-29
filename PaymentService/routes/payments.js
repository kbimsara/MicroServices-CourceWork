const express = require("express");
const router = express.Router();
const { createPayment, getPayments, updateStatus, getPaymentById, getPaymentByOrderId } = require("../controllers/paymentsController");


/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - userId
 *               - amount
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "64f8c0a2e3d4b12abc123456"
 *               userId:
 *                 type: string
 *                 example: "64f8c0a2e3d4b12abc123456"
 *               amount:
 *                 type: number
 *                 example: 150.5
 *               method:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, bank_transfer]
 *                 example: "credit_card"
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", createPayment);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", getPayments);

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       400:
 *         description: Invalid Payment ID
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:paymentId", getPaymentById);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payment by order ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment details
 *       400:
 *         description: Invalid Order ID
 *       404:
 *         description: Payment not found for this order
 *       500:
 *         description: Internal server error
 */
router.get("/order/:orderId", getPaymentByOrderId);

/**
 * @swagger
 * /payments/{paymentId}/status:
 *   patch:
 *     summary: Update payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
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
 *                 enum: [pending, completed, failed]
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Payment not found
 */
router.patch("/:paymentId/status", updateStatus);

module.exports = router;
