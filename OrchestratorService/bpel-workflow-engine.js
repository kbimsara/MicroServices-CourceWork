const { v4: uuidv4 } = require('uuid');
const ESB_CONFIG = require('./esb-config');

class BPELWorkflowEngine {
    constructor(channel, replyQueue) {
        this.channel = channel;
        this.replyQueue = replyQueue;
        this.workflowInstances = new Map();
        this.pendingRequests = new Map();
        this.compensationActions = new Map();
        this.workflowHistory = new Map();
    }

    // Create a new workflow instance
    createWorkflowInstance(orderRequest) {
        const workflowId = uuidv4();
        const workflow = {
            id: workflowId,
            status: ESB_CONFIG.states.INITIATED,
            startTime: new Date(),
            steps: [],
            compensation: [],
            data: {
                orderRequest,
                orderId: null,
                paymentId: null,
                shipmentId: null,
                metadata: {
                    correlationId: uuidv4(),
                    userId: orderRequest.userId,
                    timestamp: new Date()
                }
            },
            currentStep: 0,
            retryCount: 0,
            maxRetries: ESB_CONFIG.workflow.maxRetries,
            timeout: ESB_CONFIG.workflow.timeout
        };
        
        this.workflowInstances.set(workflowId, workflow);
        this.workflowHistory.set(workflowId, []);
        
        console.log(`BPEL Engine: Created workflow instance ${workflowId}`);
        return workflow;
    }

    // Update workflow state and log history
    updateWorkflowState(workflowId, newState, stepData = null, stepName = null) {
        const workflow = this.workflowInstances.get(workflowId);
        if (workflow) {
            const previousState = workflow.status;
            workflow.status = newState;
            
            const stepInfo = {
                state: newState,
                previousState,
                stepName,
                timestamp: new Date(),
                data: stepData
            };
            
            workflow.steps.push(stepInfo);
            this.workflowHistory.get(workflowId).push(stepInfo);
            
            if (stepData) {
                Object.assign(workflow.data, stepData);
            }
            
            console.log(`BPEL Engine: Workflow ${workflowId} state updated from ${previousState} to ${newState}`);
            
            // Publish state change event
            this.publishWorkflowEvent(workflowId, 'stateChanged', stepInfo);
        }
    }

    // Add compensation action to workflow
    addCompensationAction(workflowId, action, stepName) {
        const workflow = this.workflowInstances.get(workflowId);
        if (workflow) {
            const compensationAction = {
                id: uuidv4(),
                name: action.name || stepName,
                action: action,
                stepName,
                timestamp: new Date(),
                executed: false
            };
            
            workflow.compensation.push(compensationAction);
            console.log(`BPEL Engine: Added compensation action ${compensationAction.name} for workflow ${workflowId}`);
        }
    }

    // Execute compensation actions in reverse order (LIFO)
    async executeCompensation(workflowId) {
        const workflow = this.workflowInstances.get(workflowId);
        if (!workflow || workflow.compensation.length === 0) return;
        
        console.log(`BPEL Engine: Executing compensation for workflow ${workflowId}`);
        this.updateWorkflowState(workflowId, ESB_CONFIG.states.COMPENSATING);
        
        const compensationResults = [];
        
        // Execute compensation actions in reverse order (LIFO)
        for (let i = workflow.compensation.length - 1; i >= 0; i--) {
            const compensationAction = workflow.compensation[i];
            try {
                console.log(`BPEL Engine: Executing compensation: ${compensationAction.name}`);
                
                const result = await Promise.race([
                    compensationAction.action(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Compensation timeout')), 
                        ESB_CONFIG.workflow.compensation.timeout)
                    )
                ]);
                
                compensationAction.executed = true;
                compensationAction.result = result;
                compensationResults.push({ action: compensationAction.name, success: true, result });
                
                console.log(`BPEL Engine: Compensation action executed successfully: ${compensationAction.name}`);
                
            } catch (error) {
                console.error(`BPEL Engine: Compensation action failed: ${compensationAction.name}`, error);
                compensationAction.executed = false;
                compensationAction.error = error.message;
                compensationResults.push({ action: compensationAction.name, success: false, error: error.message });
            }
        }
        
        // Update workflow status based on compensation results
        const failedCompensations = compensationResults.filter(r => !r.success);
        if (failedCompensations.length > 0) {
            this.updateWorkflowState(workflowId, ESB_CONFIG.states.FAILED, { 
                compensationResults, 
                failedCompensations: failedCompensations.length 
            });
        } else {
            this.updateWorkflowState(workflowId, ESB_CONFIG.states.ROLLED_BACK, { compensationResults });
        }
        
        return compensationResults;
    }

    // Execute a single workflow step with retry logic
    async executeWorkflowStep(stepConfig, message, workflowId) {
        const { name, queue, timeout, retries } = stepConfig;
        let attempt = 0;
        
        while (attempt < retries) {
            try {
                console.log(`BPEL Engine: Executing step ${name} for workflow ${workflowId}, attempt ${attempt + 1}`);
                
                const result = await this.executeStepWithTimeout(name, queue, message, workflowId, timeout);
                
                console.log(`BPEL Engine: Step ${name} completed successfully for workflow ${workflowId}`);
                return result;
                
            } catch (error) {
                attempt++;
                console.log(`BPEL Engine: Step ${name} attempt ${attempt} failed for workflow ${workflowId}:`, error.message);
                
                if (attempt >= retries) {
                    throw new Error(`Step ${name} failed after ${retries} attempts: ${error.message}`);
                }
                
                // Wait before retry with exponential backoff
                const delay = ESB_CONFIG.workflow.retryDelay * Math.pow(2, attempt - 1);
                console.log(`BPEL Engine: Waiting ${delay}ms before retry for step ${name}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Execute step with timeout
    async executeStepWithTimeout(stepName, queueName, message, workflowId, timeout) {
        return new Promise((resolve, reject) => {
            const stepCorrelationId = uuidv4();
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(stepCorrelationId);
                reject(new Error(`Step ${stepName} timed out after ${timeout}ms`));
            }, timeout);
            
            // Store pending request
            this.pendingRequests.set(stepCorrelationId, { 
                resolve, 
                reject, 
                step: stepName,
                workflowId,
                timeoutId
            });
            
            // Send message to queue with replyTo field
            const messageWithHeaders = {
                ...message,
                workflowId,
                stepName,
                correlationId: stepCorrelationId,
                replyTo: this.replyQueue, // Add replyTo field
                timestamp: new Date()
            };
            
            console.log(`BPEL Engine: Sending message to queue ${queueName} with replyTo: ${this.replyQueue}`);
            
            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(messageWithHeaders)), { 
                correlationId: stepCorrelationId,
                headers: {
                    'x-workflow-id': workflowId,
                    'x-step': stepName,
                    'x-attempt': 1
                }
            });
            
            // Handle response
            const originalResolve = resolve;
            const originalReject = reject;
            
            resolve = (data) => {
                clearTimeout(timeoutId);
                this.pendingRequests.delete(stepCorrelationId);
                originalResolve(data);
            };
            
            reject = (error) => {
                clearTimeout(timeoutId);
                this.pendingRequests.delete(stepCorrelationId);
                originalReject(error);
            };
        });
    }

    // Process reply from workflow step
    processReply(correlationId, response) {
        console.log(`BPEL Engine: Processing reply for correlationId: ${correlationId}`);
        console.log(`BPEL Engine: Response:`, response);
        
        const pendingRequest = this.pendingRequests.get(correlationId);
        if (pendingRequest) {
            console.log(`BPEL Engine: Found pending request for correlationId: ${correlationId}`);
            console.log(`BPEL Engine: Pending request details:`, pendingRequest);
            
            const { resolve, reject, timeoutId, step } = pendingRequest;
            clearTimeout(timeoutId);
            this.pendingRequests.delete(correlationId);
            
            if (response.error) {
                console.log(`BPEL Engine: Rejecting step ${step} with error:`, response.error);
                reject({ error: response.error, step: step });
            } else {
                console.log(`BPEL Engine: Resolving step ${step} with data:`, response.data);
                resolve({ data: response.data, step: step });
            }
        } else {
            console.log(`BPEL Engine: No pending request found for correlationId: ${correlationId}`);
            console.log(`BPEL Engine: Available pending requests:`, Array.from(this.pendingRequests.keys()));
        }
    }

    // Publish workflow events
    publishWorkflowEvent(workflowId, eventType, data) {
        const event = {
            workflowId,
            eventType,
            timestamp: new Date(),
            data
        };
        
        const routingKey = `workflow.${eventType}`;
        this.channel.publish(ESB_CONFIG.exchange.name, routingKey, Buffer.from(JSON.stringify(event)));
    }

    // Get workflow status
    getWorkflowStatus(workflowId) {
        const workflow = this.workflowInstances.get(workflowId);
        if (workflow) {
            return {
                id: workflow.id,
                status: workflow.status,
                startTime: workflow.startTime,
                currentStep: workflow.currentStep,
                steps: workflow.steps,
                data: workflow.data,
                compensation: workflow.compensation.map(c => ({
                    name: c.name,
                    executed: c.executed,
                    timestamp: c.timestamp
                }))
            };
        }
        return null;
    }

    // Get all workflow instances
    getAllWorkflows() {
        return Array.from(this.workflowInstances.values()).map(workflow => ({
            id: workflow.id,
            status: workflow.status,
            startTime: workflow.startTime,
            currentStep: workflow.currentStep
        }));
    }

    // Clean up completed workflows
    cleanupCompletedWorkflows(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
        const now = new Date();
        const workflowsToRemove = [];
        
        for (const [workflowId, workflow] of this.workflowInstances.entries()) {
            if (workflow.status === ESB_CONFIG.states.COMPLETED || 
                workflow.status === ESB_CONFIG.states.FAILED ||
                workflow.status === ESB_CONFIG.states.ROLLED_BACK) {
                
                const age = now - workflow.startTime;
                if (age > maxAge) {
                    workflowsToRemove.push(workflowId);
                }
            }
        }
        
        workflowsToRemove.forEach(workflowId => {
            this.workflowInstances.delete(workflowId);
            this.workflowHistory.delete(workflowId);
            console.log(`BPEL Engine: Cleaned up workflow ${workflowId}`);
        });
        
        return workflowsToRemove.length;
    }
}

module.exports = BPELWorkflowEngine;
