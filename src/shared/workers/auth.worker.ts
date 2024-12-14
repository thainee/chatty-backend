import { Job } from 'bullmq';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authRepository } from '@services/db/auth.repository';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
  async addAuthToDB(job: Job): Promise<void> {
    try {
      const { value } = job.data;

      await authRepository.create(value);

      await job.updateProgress(100);
    } catch (error) {
      log.error(error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
