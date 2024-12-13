import { Job } from 'bullmq';
import Logger from 'bunyan';
import { config } from '@root/config';
import { userRepository } from '@services/db/user.repository';

const log: Logger = config.createLogger('userWorker');

class UserWorker {
  async addUserToDB(job: Job): Promise<void> {
    try {
      const { value } = job.data;

      await userRepository.create(value);

      await job.updateProgress(100);
    } catch (error) {
      log.error(error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
