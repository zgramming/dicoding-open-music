const redis = require('redis');
const { config } = require('../utils/constant');

class CacheService {
  constructor() {
    const portRedis = config.redis.port;
    const hostRedis = config.redis.server;
    const url = `redis://${hostRedis}:${portRedis}`;

    this.client = redis.createClient({
      url,
    });

    this.client.on('error', (error) => {
      console.error(error);
    });

    this.client.on('ready', () => {
      console.log('Redis berhasil terhubung');
    });

    this.client.on('end', () => {
      console.log('Redis terputus');
    });

    this.client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    const result = await this.client.set(key, value, 'EX', expirationInSecond);

    return result;
  }

  async get(key) {
    const result = await this.client.get(key);

    return result;
  }

  async delete(key) {
    const result = await this.client.del(key);

    return result;
  }
}

module.exports = CacheService;
