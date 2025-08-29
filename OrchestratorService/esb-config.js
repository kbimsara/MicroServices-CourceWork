// ESB Configuration for RabbitMQ Enterprise Service Bus
const ESB_CONFIG = {
    // RabbitMQ Connection
    rabbitmq: {
        url: 'amqp://guest:guest@rabbitmq:5672',
        options: {
            heartbeat: 60,
            connectionTimeout: 30000
        }
    },

    // Exchange Configuration
    exchange: {
        name: 'esb.exchange',
        type: 'topic',
        options: {
            durable: true,
            autoDelete: false
        }
    },

    // Dead Letter Exchange for failed messages
    deadLetter: {
        exchange: 'esb.dlx',
        queue: 'esb.dead.letter.queue',
        options: {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'esb.exchange',
                'x-message-ttl': 30000 // 30 seconds
            }
        }
    },

    // Retry Queue for failed messages
    retry: {
        queue: 'esb.retry.queue',
        options: {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'esb.exchange',
                'x-message-ttl': 10000 // 10 seconds
            }
        }
    },

    // Command Queues for service communication
    commands: {
        order: {
            queue: 'order.create.command',
            routingKey: 'order.create',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        },
        payment: {
            queue: 'payment.create.command',
            routingKey: 'payment.create',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        },
        shipping: {
            queue: 'shipping.create.command',
            routingKey: 'shipping.create',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        },
        orderUpdate: {
            queue: 'order.update.command',
            routingKey: 'order.update',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        },
        paymentUpdate: {
            queue: 'payment.update.command',
            routingKey: 'payment.update',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        },
        shippingUpdate: {
            queue: 'shipping.update.command',
            routingKey: 'shipping.update',
            options: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'esb.dlx',
                    'x-dead-letter-routing-key': 'dead.letter'
                }
            }
        }
    },

    // Event Queues for workflow monitoring
    events: {
        orderCreated: {
            queue: 'order.created.event',
            routingKey: 'order.created',
            options: { durable: true }
        },
        paymentProcessed: {
            queue: 'payment.processed.event',
            routingKey: 'payment.processed',
            options: { durable: true }
        },
        shippingCreated: {
            queue: 'shipping.created.event',
            routingKey: 'shipping.created',
            options: { durable: true }
        },
        orderCompleted: {
            queue: 'order.completed.event',
            routingKey: 'order.completed',
            options: { durable: true }
        }
    },

    // Workflow Configuration
    workflow: {
        timeout: 30000, // 30 seconds per step
        maxRetries: 3,
        retryDelay: 1000, // 1 second base delay
        compensation: {
            enabled: true,
            timeout: 15000 // 15 seconds for compensation
        }
    },

    // BPEL Workflow States for PlaceOrder
    states: {
        INITIATED: 'INITIATED',
        ORDER_CREATED: 'ORDER_CREATED',
        PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
        SHIPPING_CREATED: 'SHIPPING_CREATED',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        COMPENSATING: 'COMPENSATING',
        ROLLED_BACK: 'ROLLED_BACK'
    },

    // BPEL Workflow Steps for PlaceOrder
    steps: {
        CREATE_ORDER: {
            name: 'createOrder',
            queue: 'order.create.command',
            timeout: 30000,
            retries: 3,
            compensation: 'cancelOrder'
        },
        PROCESS_PAYMENT: {
            name: 'processPayment',
            queue: 'payment.create.command',
            timeout: 30000,
            retries: 3,
            compensation: 'refundPayment'
        },
        CREATE_SHIPPING: {
            name: 'createShipping',
            queue: 'shipping.create.command',
            timeout: 30000,
            retries: 3,
            compensation: 'cancelShipping'
        },
        UPDATE_ORDER: {
            name: 'updateOrder',
            queue: 'order.update.command',
            timeout: 15000,
            retries: 2,
            compensation: null
        },
        UPDATE_PAYMENT_STATUS: {
            name: 'updatePaymentStatus',
            queue: 'payment.update.command',
            timeout: 15000,
            retries: 2,
            compensation: null
        },
        UPDATE_SHIPPING_STATUS: {
            name: 'updateShippingStatus',
            queue: 'shipping.update.command',
            timeout: 15000,
            retries: 2,
            compensation: null
        }
    }
};

module.exports = ESB_CONFIG;
