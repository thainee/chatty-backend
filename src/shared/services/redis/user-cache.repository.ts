import Logger from 'bunyan';
import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@globals/helpers/error-handler';
import { redisConnection } from '@services/redis/redis.connection';

const log: Logger = config.createLogger('userCacheRepository');

class UserCacheRepository {
  public async save(
    key: string,
    userUId: string,
    createdUser: IUserDocument
  ): Promise<void> {
    const dataToSave: string[] = this.prepareCacheData(createdUser);

    try {
      await redisConnection.zadd('user', parseInt(userUId, 10), key);
      await redisConnection.hset(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private prepareCacheData(user: IUserDocument): string[] {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      fullname,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = user;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'fullname',
      `${fullname}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'postsCount',
      `${postsCount}`,
      'createdAt',
      `${createdAt}`,
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`
    ];

    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];

    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];

    return [...firstList, ...secondList, ...thirdList];
  }
}

export const userCacheRepository: UserCacheRepository =
  new UserCacheRepository();
