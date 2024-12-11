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
import { UserCache } from '@services/redis/user.cache';
import { config } from '@root/config';

const userCache: UserCache = new UserCache();

class SignUp {
  @joiValidation(signupSchema)
  public async createUser(req: Request, res: Response): Promise<void> {
    const { username, fullname, password, email, avatarColor, avatarImage } =
      req.body;
    const [userByEmail, userByUsername] = await Promise.all([
      authService.getUserByEmail(email),
      authService.getUserByUsername(username)
    ]);

    if (userByEmail) {
      throw new BadRequestError('Email already exists');
    }

    if (userByUsername) {
      throw new BadRequestError('Username already exists');
    }

    const authObjectId = new ObjectId();
    const userObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData = signUpController.signUpData({
      _id: authObjectId,
      uId,
      username,
      fullname,
      email,
      password,
      avatarColor
    });
    const imageLink = await uploadToCloudinary(avatarImage, {
      public_id: `${userObjectId}`,
      overwrite: true,
      invalidate: true
    });

    if (!imageLink?.public_id) {
      throw new BadRequestError('Image upload failed');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = signUpController.userData(
      authData,
      userObjectId
    );
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${imageLink.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'User created successfully', authData });
  }

  private signUpData(data: ISignUpData): IAuthDocument {
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

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor, fullname } = data;
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

export const signUpController: SignUp = new SignUp();
