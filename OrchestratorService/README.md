# ESB Orchestrator Service with BPEL Workflow Engine

This service implements a RabbitMQ-based Enterprise Service Bus (ESB) with BPEL (Business Process Execution Language) workflow orchestration for the GlobalBooks microservices architecture.

## Architecture Overview

### ESB Components
- **RabbitMQ ESB**: Centralized message broker with topic exchanges
- **Dead Letter Queues**: Handle failed messages with retry mechanisms
- **Event-Driven Architecture**: Publish-subscribe pattern for workflow monitoring
- **Command-Query Separation**: Separate queues for commands and events

### BPEL Workflow Engine
- **Workflow Orchestration**: Sequential execution of business processes
- **State Management**: Track workflow progress and state transitions
- **Compensation Logic**: Automatic rollback of completed steps on failure
- **Retry Mechanisms**: Configurable retry policies with exponential backoff
- **Timeout Handling**: Configurable timeouts for each workflow step

## PlaceOrder Workflow

The PlaceOrder workflow orchestrates the complete order placement process:

1. **Create Order** → OrderService
2. **Process Payment** → PaymentService  
3. **Create Shipping** → ShippingService
4. **Update Order Status** → OrderService

### Workflow States
- `INITIATED`: Workflow started
- `ORDER_CREATED`: Order created successfully
- `PAYMENT_PROCESSED`: Payment processed successfully
- `SHIPPING_CREATED`: Shipping created successfully
- `COMPLETED`: Workflow completed successfully
- `FAILED`: Workflow failed
- `COMPENSATING`: Executing compensation actions
- `ROLLED_BACK`: Workflow rolled back after compensation

## Configuration

### ESB Configuration (`esb-config.js`)
- RabbitMQ connection settings
- Queue definitions with dead letter handling
- Workflow timeout and retry configurations
- BPEL workflow step definitions

### Hardcoded Values (No Environment Dependencies)
- Port: 3003
- RabbitMQ URL: `amqp://guest:guest@rabbitmq:5672`
- All queue names and routing keys
- Timeout and retry configurations

## API Endpoints

### Workflow Management
- `POST /purchase` - Initiate PlaceOrder workflow
- `GET /workflow/:workflowId` - Get workflow status
- `GET /workflows` - List all workflows
- `GET /workflow-definition` - Get workflow definition

### System Information
- `GET /esb-config` - Get ESB configuration
- `GET /health` - Health check

## Message Flow

### Command Messages
```
Orchestrator → Command Queue → Service → Reply Queue → Orchestrator
```

### Event Messages
```
Service → Event Queue → Orchestrator (Monitoring)
```

### Compensation Flow
```
Workflow Failure → Compensation Actions (Reverse Order) → Rollback
```

## Error Handling

### Retry Logic
- Configurable retry attempts per step
- Exponential backoff between retries
- Step-level timeout handling

### Dead Letter Queues
- Failed messages sent to dead letter queue
- Automatic retry after configurable delay
- Manual intervention for permanently failed messages

### Compensation
- Automatic rollback of completed steps
- Reverse execution order (LIFO)
- Compensation action timeout handling

## Monitoring and Observability

### Workflow Tracking
- Real-time workflow state updates
- Step-by-step execution logging
- Compensation action tracking

### Event Publishing
- Workflow state change events
- Completion and failure events
- Compensation execution events

## Usage Examples

### Initiate PlaceOrder Workflow
```bash
curl -X POST http://localhost:3003/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "123",
    "quantity": 2,
    "userId": "user123",
    "amount": 99.99,
    "shippingAddress": "123 Main St, City, State",
    "paymentMethod": "credit_card"
  }'
```

### Check Workflow Status
```bash
curl http://localhost:3003/workflow/{workflowId}
```

### Get All Workflows
```bash
curl http://localhost:3003/workflows
```

## Docker Integration

The service is designed to run in Docker containers with:
- RabbitMQ dependency
- Automatic health checks
- Graceful shutdown handling
- Network isolation via Docker networks

## Performance Considerations

### Queue Durability
- All command and event queues are durable
- Messages survive RabbitMQ restarts
- Dead letter queues for reliability

### Workflow Cleanup
- Automatic cleanup of completed workflows
- Configurable retention period (default: 24 hours)
- Memory-efficient workflow tracking

### Timeout Management
- Step-level timeouts (default: 30 seconds)
- Compensation timeouts (default: 15 seconds)
- Overall workflow timeout handling

## Security Features

### Message Validation
- Input validation for all workflow requests
- Correlation ID tracking for message integrity
- Workflow ID isolation

### Access Control
- No authentication (configure as needed)
- Workflow isolation by ID
- Compensation action validation

## Troubleshooting

### Common Issues
1. **RabbitMQ Connection Failed**: Check RabbitMQ service status
2. **Workflow Timeout**: Increase timeout values in configuration
3. **Compensation Failure**: Check service availability for rollback actions

### Debug Information
- Enable debug logging for detailed workflow execution
- Monitor RabbitMQ management UI for queue status
- Check workflow history for step-by-step execution

## Future Enhancements

### Planned Features
- Workflow versioning and migration
- Dynamic workflow composition
- Advanced compensation strategies
- Workflow performance metrics
- Integration with external monitoring tools

### Scalability Improvements
- Horizontal scaling of orchestrator instances
- Workflow distribution across multiple nodes
- Advanced load balancing strategies
- Caching and optimization

## Dependencies

- Node.js 14+
- Express.js
- amqplib (RabbitMQ client)
- uuid (Unique identifier generation)

## License

This service is part of the GlobalBooks microservices architecture and follows the same licensing terms.
