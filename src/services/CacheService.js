const redis = require('redis');
const { config } = require('../utils/constant');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      socket: {
        host: config.redis.server,
      },
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

  async set(key, value, expirationInSecond = 1800) {
    const result = await this.client.set(key, value, {
      EX: expirationInSecond,
    });

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
