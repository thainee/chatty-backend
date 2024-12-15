import { Job } from 'bullmq';
import Logger from 'bunyan';
import { config } from '@root/config';
import { mailTransport } from '@services/emails/mail.transport';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
  async addNotificationEmail(job: Job): Promise<void> {
    try {
      const { receiverEmail, subject, template } = job.data;

      await mailTransport.sendEmail(receiverEmail, subject, template);

      await job.updateProgress(100);
    } catch (error) {
      log.error(error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
