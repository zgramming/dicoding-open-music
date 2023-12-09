const amqp = require('amqplib');
const { config } = require('../utils/constant');

const RabbitMQService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMQ.server);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(message));

    // Berikan jeda waktu 1 detik sebelum menutup koneksi RabbitMQ server
    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = RabbitMQService;
