import { Queue, Job, Worker } from 'bullmq';
import Logger from 'bunyan';
import IORedis from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@user/interfaces/user.interface';

const connection = new IORedis({ maxRetriesPerRequest: null });

type IBaseJobData = IAuthJob | IEmailJob;

let bullAdapter: BullMQAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue;
  worker?: Worker;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName);
    bullAdapter.push(new BullMQAdapter(this.queue));
    bullAdapter = [...new Set(bullAdapter)];

    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapter,
      serverAdapter
    });

    this.log = config.createLogger(`${queueName}Queue`);
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 }
    });
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: (job: Job) => Promise<void>
  ): void {
    this.worker = new Worker(
      this.queue.name,
      async (job) => {
        if (job.name === name) {
          await callback(job);
        }
      },
      { connection, concurrency }
    );

    this.worker.on('completed', (job) => {
      this.log.info(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.log.error(`Job ${job?.id} failed with error: ${err.message}`);
    });
  }
}
