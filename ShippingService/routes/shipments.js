const express = require("express");
const router = express.Router();
const { createShipping, getShipments, updateStatus, deleteShipment } = require("../controllers/shippingController");
const checkJwt = require("../middleware/auth");

// Apply JWT middleware
router.use(checkJwt);

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Shipping management
 */

/**
 * @swagger
 * /shipments:
 *   post:
 *     summary: Create a new shipment
 *     tags: [Shipments]
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
 *               - address
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "64f8c0a2e3d4b12abc123456"
 *               userId:
 *                 type: string
 *                 example: "64f8c0a2e3d4b12abc123456"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Colombo, Sri Lanka"
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered, cancelled]
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", createShipping);

/**
 * @swagger
 * /shipments:
 *   get:
 *     summary: Get all shipments
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled]
 *           example: pending
 *         description: Filter shipments by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of shipments per page
 *     responses:
 *       200:
 *         description: List of shipments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       orderId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       address:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 */
router.get("/", getShipments);

/**
 * @swagger
 * /shipments/{shipmentId}/status:
 *   patch:
 *     summary: Update shipment status
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8c0a2e3d4b12abc123456"
 *         description: Shipment ID
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
 *                 enum: [pending, shipped, delivered, cancelled]
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:shipmentId/status", updateStatus);

/**
 * @swagger
 * /shipments/{shipmentId}:
 *   delete:
 *     summary: Delete a shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8c0a2e3d4b12abc123456"
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:shipmentId", deleteShipment);

module.exports = router;
