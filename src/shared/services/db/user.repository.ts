import mongoose from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';

class UserRepository {
  public async create(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async getById(id: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      ...this.getUserAggregationPipeline('_id', new mongoose.Types.ObjectId(id))
    ]);

    return users[0];
  }

  public async getByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      ...this.getUserAggregationPipeline(
        'authId',
        new mongoose.Types.ObjectId(authId)
      )
    ]);

    return users[0];
  }

  private getUserAggregationPipeline(
    matchField: string,
    matchValue: mongoose.Types.ObjectId
  ) {
    return [
      { $match: { [matchField]: matchValue } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'auth'
        }
      },
      { $unwind: '$auth' },
      { $project: this.aggregateProject() }
    ];
  }

  private aggregateProject() {
    return {
      _id: 1,
      authId: 1,
      username: '$auth.username',
      fullname: '$auth.fullname',
      uId: '$auth.uId',
      email: '$auth.email',
      avatarColor: '$auth.avatarColor',
      createdAt: '$auth.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}

export const userRepository: UserRepository = new UserRepository();
