const SERVER_HOSTNAME = 'localhost';
const SERVER_AUTH_STRATEGY_NAME = 'openmusic_jwt';
const QUEUE_NAME_EXPORT_PLAYLIST = 'export:playlist';

const config = {
  rabbitMQ: {
    server: process.env.RABBITMQ_SERVERF,
  },
  redis: {
    server: process.env.REDIS_SERVER,
  },
};

module.exports = {
  SERVER_HOSTNAME,
  SERVER_AUTH_STRATEGY_NAME,
  QUEUE_NAME_EXPORT_PLAYLIST,
  config,
};
