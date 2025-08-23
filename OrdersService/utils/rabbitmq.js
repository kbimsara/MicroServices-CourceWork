const amqp = require("amqplib");

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
}

async function consume(queue, callback) {
  if (!channel) await connectRabbitMQ();
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
}

async function publish(queue, message) {
  if (!channel) await connectRabbitMQ();
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

module.exports = { publish, consume };
