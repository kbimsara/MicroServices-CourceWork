const amqp = require("amqplib");

let channel;

async function getChannel() {
  if (!channel) {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
  }
  return channel;
}

async function consume(queue, callback) {
  const ch = await getChannel();
  await ch.assertQueue(queue, { durable: true });
  ch.consume(queue, (msg) => {
    if (msg !== null) {
      const parsedMessage = JSON.parse(msg.content.toString());
      callback(parsedMessage);
      ch.ack(msg);
    }
  });
}

async function publish(queue, message) {
  const ch = await getChannel();
  await ch.assertQueue(queue, { durable: false, autoDelete: true }); // Added autoDelete: true
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

module.exports = { publish, consume };
