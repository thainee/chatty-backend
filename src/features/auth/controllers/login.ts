import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { config } from '@root/config';
import { loginSchema } from '@auth/validators/login.joi';
import { BadRequestError } from '@globals/helpers/error-handler';
import { authRepository } from '@services/db/auth.repository';
import { userRepository } from '@services/db/user.repository';
import { IUserDocument } from '@user/interfaces/user.interface';

export class LogIn {
  @joiValidation(loginSchema)
  public async logIn(req: Request, res: Response): Promise<void> {
    const { usernameOrEmail, password } = req.body;

    const existingAuth =
      await authRepository.getByUsernameOrEmail(usernameOrEmail);

    if (!existingAuth) {
      throw new BadRequestError('Invalid credentials');
    }

    const isPasswordMatch = await existingAuth.comparePassword(password);

    if (!isPasswordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user = await userRepository.getByAuthId(`${existingAuth._id}`);

    const userJWT = jwt.sign(
      {
        userId: existingAuth._id,
        uId: existingAuth.uId,
        email: existingAuth.email,
        username: existingAuth.username,
        fullname: existingAuth.fullname,
        avatarColor: existingAuth.avatarColor
      },
      config.JWT_SECRET
    );

    const userDocument: IUserDocument = {
      ...user,
      authId: existingAuth._id,
      username: existingAuth.username,
      email: existingAuth.email,
      fullname: existingAuth.fullname,
      uId: existingAuth.uId,
      avatarColor: existingAuth.avatarColor,
      createdAt: existingAuth.createdAt
    } as IUserDocument;

    req.session = { jwt: userJWT };
    res.status(HTTP_STATUS.OK).json({
      message: 'User logged in successfully',
      user: userDocument,
      token: userJWT
    });
  }
}
