import { Queue } from 'bullmq';
import type { JobsOptions, QueueOptions } from 'bullmq';
import config from './mail.config.js';
import type { SimpleMail } from './mail.interface';
import { logger } from '../logger.js';
import { createRedis } from '../redis.js';
import { IS_TEST } from '../constants.js';
import { transport } from './transport.js';

export class MailClient {
  private queue: Queue;

  constructor(opts: QueueOptions = {}) {
    if (IS_TEST) return;
    this.queue = new Queue<SimpleMail>(config.queueName, {
      connection: createRedis({ maxRetriesPerRequest: null }),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
      ...opts,
    });
  }

  async enqueue(jobName: string, mail: SimpleMail, jobOpts?: JobsOptions) {
    if (IS_TEST) {
      await transport.sendMail(mail);
      return;
    }
    await this.queue.add(jobName, mail, jobOpts);
    logger.info(`Enqueued an email sending to ${mail.to}`);
  }

  close() {
    return this.queue.close();
  }
}
