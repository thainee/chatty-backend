import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { uploadToCloudinary } from '@globals/helpers/cloudinary-upload';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Helpers } from '@globals/helpers/helpers';
import { config } from '@root/config';
import { userCache } from '@services/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';

export class SignUp {
  @joiValidation(signupSchema)
  public async createUser(req: Request, res: Response): Promise<void> {
    const { username, fullname, password, email, avatarColor, avatarImage } =
      req.body;

    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      authService.getUserByEmail(email),
      authService.getUserByUsername(username)
    ]);

    if (existingUserByEmail) {
      throw new BadRequestError('Email already exists');
    }

    if (existingUserByUsername) {
      throw new BadRequestError('Username already exists');
    }

    const authObjectId = new ObjectId();
    const userObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const authDocumentData: IAuthDocument =
      SignUp.prototype.prepareAuthDocumentData({
        _id: authObjectId,
        uId,
        username,
        fullname,
        email,
        password,
        avatarColor
      });

    const cloudinaryUploadResult = await uploadToCloudinary(avatarImage, {
      public_id: `${userObjectId}`,
      overwrite: true,
      invalidate: true
    });

    if (!cloudinaryUploadResult?.public_id) {
      throw new BadRequestError('Image upload failed');
    }

    // Add to redis cache
    const userCacheData: IUserDocument = SignUp.prototype.prepareUserCacheData(
      authDocumentData,
      userObjectId
    );

    userCacheData.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${cloudinaryUploadResult.version}/${userObjectId}`;

    await userCache.saveUserToCache(`${userObjectId}`, uId, userCacheData);

    // Add to database
    omit(userCacheData, [
      'uId',
      'username',
      'email',
      'avatarColor',
      'password'
    ]);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: userCacheData });
    userQueue.addUserJob('addUserToDB', { value: userCacheData });

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'User created successfully', authDocumentData });
  }

  private prepareAuthDocumentData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor, fullname } = data;

    return {
      _id,
      uId,
      username,
      fullname,
      email,
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private prepareUserCacheData(
    authData: IAuthDocument,
    userObjectId: ObjectId
  ): IUserDocument {
    const { _id, username, email, uId, password, avatarColor, fullname } =
      authData;

    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username,
      fullname: Helpers.toFirstLetterUpperCase(fullname),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}

export const signUp = new SignUp();
