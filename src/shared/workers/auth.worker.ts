import { Job } from 'bullmq';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
  async addAuthToDB(job: Job): Promise<void> {
    try {
      const { value } = job.data;

      await authService.createAuth(value);

      await job.updateProgress(100);
    } catch (error) {
      log.error(error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
