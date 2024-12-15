import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

class AuthRepository {
  public async create(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updatePasswordResetToken(
    id: string,
    token: string,
    tokenExpiration: number
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: id },
      { passwordResetToken: token, passwordResetExpires: tokenExpiration }
    );
  }

  public async getByUsername(username: string): Promise<IAuthDocument | null> {
    const query = { username: username.toLowerCase() };

    const auth = await AuthModel.findOne(query);

    return auth;
  }

  public async getByEmail(email: string): Promise<IAuthDocument | null> {
    const query = {
      email: email.toLowerCase()
    };

    const auth = await AuthModel.findOne(query);

    return auth;
  }

  public async getByUsernameOrEmail(
    usernameOrEmail: string
  ): Promise<IAuthDocument | null> {
    const query = {
      $or: [
        { username: usernameOrEmail.toLowerCase() },
        { email: usernameOrEmail.toLowerCase() }
      ]
    };

    const auth = await AuthModel.findOne(query);

    return auth;
  }

  public async getByPasswordResetToken(
    token: string | unknown
  ): Promise<IAuthDocument | null> {
    const query = {
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    };

    const auth = await AuthModel.findOne(query);

    return auth;
  }
}

export const authRepository: AuthRepository = new AuthRepository();
