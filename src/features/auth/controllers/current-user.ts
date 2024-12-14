import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { userRepository } from '@services/db/user.repository';
import { userCacheRepository } from '@services/redis/user-cache.repository';

export class CurrentUser {
  public async get(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser = await userCacheRepository.get(
      `${req.currentUser!.userId}`
    );

    const existingUser = cachedUser
      ? cachedUser
      : await userRepository.getById(`${req.currentUser!.userId}`);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
