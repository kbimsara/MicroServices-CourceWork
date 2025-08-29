const amqp = require("amqplib");

let channel;
let connection;

async function getChannel() {
  if (!channel || channel.connection === null) {
    try {
      if (connection) {
        await connection.close();
      }
      
      connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
      channel = await connection.createChannel();
      
      // Handle channel errors
      channel.on('error', async (err) => {
        console.error('RabbitMQ channel error:', err);
        channel = null;
      });
      
      channel.on('close', () => {
        console.log('RabbitMQ channel closed');
        channel = null;
      });
      
      // Declare ESB Exchange
      await channel.assertExchange('esb.exchange', 'topic', { durable: true });
      
      // Declare Dead Letter Exchange
      await channel.assertExchange('esb.dlx', 'direct', { durable: true });
      
    } catch (error) {
      console.error('Failed to create RabbitMQ channel:', error);
      throw error;
    }
  }
  return channel;
}

async function consume(queue, callback) {
  try {
    const ch = await getChannel();
    
    // Configure queue based on type
    if (queue.includes('.command')) {
      // Command queues with dead letter exchange
      await ch.assertQueue(queue, { 
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'esb.dlx',
          'x-dead-letter-routing-key': 'dead.letter'
        }
      });
    } else {
      // Regular queues
      await ch.assertQueue(queue, { durable: true });
    }
    
    ch.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const parsedMessage = JSON.parse(msg.content.toString());
          callback(parsedMessage);
          ch.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          ch.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('Error setting up consumer for queue:', queue, error);
    throw error;
  }
}

async function publish(queue, message) {
  try {
    // Validate queue parameter
    if (!queue) {
      console.error('Error: Queue name is undefined or null');
      return;
    }
    
    const ch = await getChannel();
    
    // Don't assert reply queues - they're created by the orchestrator
    if (queue.startsWith('orchestrator_reply_queue_')) {
      console.log(`RabbitMQ: Publishing to orchestrator reply queue: ${queue}`);
      ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      return;
    }
    
    // Configure queue based on type
    if (queue.includes('.command')) {
      // Command queues with dead letter exchange
      await ch.assertQueue(queue, { 
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'esb.dlx',
          'x-dead-letter-routing-key': 'dead.letter'
        }
      });
    } else {
      // Regular queues
      await ch.assertQueue(queue, { durable: false, autoDelete: true });
    }
    
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } catch (error) {
    console.error('Error publishing message to queue:', queue, error);
    throw error;
  }
}

module.exports = { publish, consume };
