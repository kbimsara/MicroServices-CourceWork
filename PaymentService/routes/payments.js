const express = require("express");
const router = express.Router();
const { createPayment, getPayments, updateStatus } = require("../controllers/paymentsController");
const checkJwt = require("../middleware/auth");

// Apply JWT middleware to all routes
router.use(checkJwt);

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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 * /payments/{paymentId}/status:
 *   patch:
 *     summary: Update payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
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
