import Redis from 'ioredis';
import Logger from 'bunyan';
import { config } from '@root/config';

export abstract class BaseCache {
  client: Redis;
  log: Logger;

  constructor(cacheName: string) {
    this.client = new Redis(config.REDIS_URL, {
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'CONNECTION'];
        return targetErrors.some(error => err.message.includes(error));
      }
    });
    this.log = config.createLogger(cacheName);
  }
}
