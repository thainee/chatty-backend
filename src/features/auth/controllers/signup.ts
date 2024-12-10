import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { uploadToCloudinary } from '@globals/helpers/cloudinary-upload';

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
    const uId = uuidv4();
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
}

export const signUpController: SignUp = new SignUp();
