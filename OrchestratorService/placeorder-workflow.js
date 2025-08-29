const ESB_CONFIG = require('./esb-config');

// PlaceOrder BPEL Workflow Definition
class PlaceOrderWorkflow {
    constructor(bpelEngine) {
        this.bpelEngine = bpelEngine;
        this.workflowName = 'PlaceOrder';
        this.version = '1.0';
    }

    // Execute the complete PlaceOrder workflow
    async execute(orderRequest) {
        const workflow = this.bpelEngine.createWorkflowInstance(orderRequest);
        const workflowId = workflow.id;
        
        console.log(`PlaceOrder Workflow: Starting workflow ${workflowId} for user ${orderRequest.userId}`);
        
        try {
            // Step 1: Create Order
            await this.executeCreateOrder(orderRequest, workflowId);
            
            // Step 2: Process Payment
            await this.executeProcessPayment(orderRequest, workflowId);
            
            // Step 3: Create Shipping
            await this.executeCreateShipping(orderRequest, workflowId);
            
            // Step 4: Update Order Status
            const orderStatusUpdated = await this.executeUpdateOrderStatus(workflowId);
            if (!orderStatusUpdated) {
                throw new Error('Order status update failed');
            }

            // Step 5: Update Payment Status to Completed
            const paymentStatusUpdated = await this.executeUpdatePaymentStatus(workflowId);
            if (!paymentStatusUpdated) {
                throw new Error('Payment status update failed');
            }

            // Step 6: Update Shipping Status to Completed
            const shippingStatusUpdated = await this.executeUpdateShippingStatus(workflowId);
            if (!shippingStatusUpdated) {
                throw new Error('Shipping status update failed');
            }
            
            // Workflow completed successfully
            this.bpelEngine.updateWorkflowState(workflowId, ESB_CONFIG.states.COMPLETED, null, 'workflowCompleted');
            
            // Publish completion event
            this.bpelEngine.publishWorkflowEvent(workflowId, 'completed', {
                orderId: workflow.data.orderId,
                paymentId: workflow.data.paymentId,
                shipmentId: workflow.data.shipmentId,
                status: 'SUCCESS'
            });
            
            console.log(`PlaceOrder Workflow: Workflow ${workflowId} completed successfully`);
            
            return {
                workflowId,
                status: 'SUCCESS',
                orderId: workflow.data.orderId,
                paymentId: workflow.data.paymentId,
                shipmentId: workflow.data.shipmentId,
                message: 'Purchase order processed successfully'
            };
            
        } catch (error) {
            console.error(`PlaceOrder Workflow: Workflow ${workflowId} failed:`, error.message);
            
            // Execute compensation
            await this.executeCompensation(workflowId);
            
            // Update workflow status
            this.bpelEngine.updateWorkflowState(workflowId, ESB_CONFIG.states.FAILED, { 
                error: error.message 
            }, 'workflowFailed');
            
            // Publish failure event
            this.bpelEngine.publishWorkflowEvent(workflowId, 'failed', {
                error: error.message,
                status: 'FAILED'
            });
            
            throw error;
        }
    }

    // Step 1: Create Order
    async executeCreateOrder(orderRequest, workflowId) {
        console.log(`PlaceOrder Workflow: Executing Create Order step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.CREATE_ORDER;
        const message = {
            productId: orderRequest.productId,
            quantity: orderRequest.quantity,
            userId: orderRequest.userId,
            amount: orderRequest.amount,
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.orderId) {
            this.bpelEngine.updateWorkflowState(workflowId, ESB_CONFIG.states.ORDER_CREATED, {
                orderId: result.data.orderId
            }, 'createOrder');
            
            // Add compensation action for order creation
            this.bpelEngine.addCompensationAction(workflowId, async () => {
                console.log(`PlaceOrder Workflow: Compensating order creation for workflow ${workflowId}`);
                return await this.compensateOrderCreation(result.data.orderId, workflowId);
            }, 'createOrder');
            
            console.log(`PlaceOrder Workflow: Order created successfully with ID: ${result.data.orderId}`);
            return result.data.orderId;
        } else {
            throw new Error('Order creation failed: No order ID returned');
        }
    }

    // Step 2: Process Payment
    async executeProcessPayment(orderRequest, workflowId) {
        console.log(`PlaceOrder Workflow: Executing Process Payment step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.PROCESS_PAYMENT;
        const message = {
            orderId: this.bpelEngine.workflowInstances.get(workflowId).data.orderId,
            userId: orderRequest.userId,
            amount: orderRequest.amount,
            method: orderRequest.paymentMethod,
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.paymentId) {
            this.bpelEngine.updateWorkflowState(workflowId, ESB_CONFIG.states.PAYMENT_PROCESSED, {
                paymentId: result.data.paymentId
            }, 'processPayment');
            
            // Add compensation action for payment processing
            this.bpelEngine.addCompensationAction(workflowId, async () => {
                console.log(`PlaceOrder Workflow: Compensating payment processing for workflow ${workflowId}`);
                return await this.compensatePaymentProcessing(result.data.paymentId, workflowId);
            }, 'processPayment');
            
            console.log(`PlaceOrder Workflow: Payment processed successfully with ID: ${result.data.paymentId}`);
            return result.data.paymentId;
        } else {
            throw new Error('Payment processing failed: No payment ID returned');
        }
    }

    // Step 3: Create Shipping
    async executeCreateShipping(orderRequest, workflowId) {
        console.log(`PlaceOrder Workflow: Executing Create Shipping step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.CREATE_SHIPPING;
        const message = {
            orderId: this.bpelEngine.workflowInstances.get(workflowId).data.orderId,
            userId: orderRequest.userId,
            address: orderRequest.shippingAddress,
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.shipmentId) {
            this.bpelEngine.updateWorkflowState(workflowId, ESB_CONFIG.states.SHIPPING_CREATED, {
                shipmentId: result.data.shipmentId
            }, 'createShipping');
            
            // Add compensation action for shipping creation
            this.bpelEngine.addCompensationAction(workflowId, async () => {
                console.log(`PlaceOrder Workflow: Compensating shipping creation for workflow ${workflowId}`);
                return await this.compensateShippingCreation(result.data.shipmentId, workflowId);
            }, 'createShipping');
            
            console.log(`PlaceOrder Workflow: Shipping created successfully with ID: ${result.data.shipmentId}`);
            return result.data.shipmentId;
        } else {
            throw new Error('Shipping creation failed: No shipment ID returned');
        }
    }

    // Step 4: Update Order Status
    async executeUpdateOrderStatus(workflowId) {
        console.log(`PlaceOrder Workflow: Executing Update Order Status step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.UPDATE_ORDER;
        const message = {
            orderId: this.bpelEngine.workflowInstances.get(workflowId).data.orderId,
            status: 'completed',
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.status === 'completed') {
            console.log(`PlaceOrder Workflow: Order status updated successfully for workflow ${workflowId}`);
            return true;
        } else {
            throw new Error('Order status update failed');
        }
    }

    // Step 5: Update Payment Status to Completed
    async executeUpdatePaymentStatus(workflowId) {
        console.log(`PlaceOrder Workflow: Executing Update Payment Status step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.UPDATE_PAYMENT_STATUS;
        const message = {
            paymentId: this.bpelEngine.workflowInstances.get(workflowId).data.paymentId,
            status: 'completed',
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.status === 'completed') {
            console.log(`PlaceOrder Workflow: Payment status updated successfully for workflow ${workflowId}`);
            return true;
        } else {
            throw new Error('Payment status update failed');
        }
    }

    // Step 6: Update Shipping Status to Completed
    async executeUpdateShippingStatus(workflowId) {
        console.log(`PlaceOrder Workflow: Executing Update Shipping Status step for workflow ${workflowId}`);
        
        const stepConfig = ESB_CONFIG.steps.UPDATE_SHIPPING_STATUS;
        const message = {
            shipmentId: this.bpelEngine.workflowInstances.get(workflowId).data.shipmentId,
            status: 'completed',
            timestamp: new Date()
        };
        
        const result = await this.bpelEngine.executeWorkflowStep(stepConfig, message, workflowId);
        
        if (result.data && result.data.status === 'completed') {
            console.log(`PlaceOrder Workflow: Shipping status updated successfully for workflow ${workflowId}`);
            return true;
        } else {
            throw new Error('Shipping status update failed');
        }
    }

    // Compensation Actions

    // Compensate Order Creation
    async compensateOrderCreation(orderId, workflowId) {
        console.log(`PlaceOrder Workflow: Compensating order creation for order ${orderId}`);
        
        try {
            // Send cancel order command
            const cancelMessage = {
                orderId,
                workflowId,
                reason: 'Compensation due to workflow failure',
                timestamp: new Date()
            };
            
            this.bpelEngine.channel.sendToQueue('order.cancel.command', Buffer.from(JSON.stringify(cancelMessage)), {
                correlationId: require('uuid').v4(),
                headers: {
                    'x-workflow-id': workflowId,
                    'x-compensation': 'true'
                }
            });
            
            return { success: true, action: 'orderCancelled' };
        } catch (error) {
            console.error(`PlaceOrder Workflow: Order compensation failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Compensate Payment Processing
    async compensatePaymentProcessing(paymentId, workflowId) {
        console.log(`PlaceOrder Workflow: Compensating payment processing for payment ${paymentId}`);
        
        try {
            // Send refund payment command
            const refundMessage = {
                paymentId,
                workflowId,
                reason: 'Compensation due to workflow failure',
                timestamp: new Date()
            };
            
            this.bpelEngine.channel.sendToQueue('payment.refund.command', Buffer.from(JSON.stringify(refundMessage)), {
                correlationId: require('uuid').v4(),
                headers: {
                    'x-workflow-id': workflowId,
                    'x-compensation': 'true'
                }
            });
            
            return { success: true, action: 'paymentRefunded' };
        } catch (error) {
            console.error(`PlaceOrder Workflow: Payment compensation failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Compensate Shipping Creation
    async compensateShippingCreation(shipmentId, workflowId) {
        console.log(`PlaceOrder Workflow: Compensating shipping creation for shipment ${shipmentId}`);
        
        try {
            // Send cancel shipping command
            const cancelMessage = {
                shipmentId,
                workflowId,
                reason: 'Compensation due to workflow failure',
                timestamp: new Date()
            };
            
            this.bpelEngine.channel.sendToQueue('shipping.cancel.command', Buffer.from(JSON.stringify(cancelMessage)), {
                correlationId: require('uuid').v4(),
                headers: {
                    'x-workflow-id': workflowId,
                    'x-compensation': 'true'
                }
            });
            
            return { success: true, action: 'shippingCancelled' };
        } catch (error) {
            console.error(`PlaceOrder Workflow: Shipping compensation failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Execute compensation for the entire workflow
    async executeCompensation(workflowId) {
        console.log(`PlaceOrder Workflow: Executing compensation for workflow ${workflowId}`);
        
        try {
            const compensationResults = await this.bpelEngine.executeCompensation(workflowId);
            console.log(`PlaceOrder Workflow: Compensation completed for workflow ${workflowId}:`, compensationResults);
            return compensationResults;
        } catch (error) {
            console.error(`PlaceOrder Workflow: Compensation failed for workflow ${workflowId}:`, error);
            throw error;
        }
    }

    // Get workflow definition
    getWorkflowDefinition() {
        return {
            name: this.workflowName,
            version: this.version,
            description: 'PlaceOrder BPEL Workflow for processing purchase orders',
            steps: [
                {
                    name: 'Create Order',
                    type: 'invoke',
                    service: 'OrderService',
                    operation: 'createOrder',
                    compensation: 'cancelOrder'
                },
                {
                    name: 'Process Payment',
                    type: 'invoke',
                    service: 'PaymentService',
                    operation: 'processPayment',
                    compensation: 'refundPayment'
                },
                {
                    name: 'Create Shipping',
                    type: 'invoke',
                    service: 'ShippingService',
                    operation: 'createShipping',
                    compensation: 'cancelShipping'
                },
                {
                    name: 'Update Order Status',
                    type: 'invoke',
                    service: 'OrderService',
                    operation: 'updateOrderStatus',
                    compensation: null
                }
            ],
            compensation: {
                enabled: true,
                strategy: 'reverse-order',
                timeout: ESB_CONFIG.workflow.compensation.timeout
            }
        };
    }
}

module.exports = PlaceOrderWorkflow;
