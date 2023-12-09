const SERVER_HOSTNAME = 'localhost';
const SERVER_AUTH_STRATEGY_NAME = 'openmusic_jwt';
const QUEUE_NAME_EXPORT_PLAYLIST = 'export:playlist';

const config = {
  hapiServerOptions: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
  jwtOptions: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMQ: {
    server: process.env.RABBITMQ_SERVERF,
  },
  redis: {
    server: process.env.REDIS_SERVER || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
};

module.exports = {
  SERVER_HOSTNAME,
  SERVER_AUTH_STRATEGY_NAME,
  QUEUE_NAME_EXPORT_PLAYLIST,
  config,
};
