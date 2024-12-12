import Redis from 'ioredis';
import { config } from '@root/config';

export const redisConnection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 2,
  reconnectOnError: (err) => {
    const targetErrors = ['READONLY', 'CONNECTION'];
    return targetErrors.some((error) => err.message.includes(error));
  }
});
