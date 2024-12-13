import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

class AuthRepository {
  public async create(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getByUsername(username: string): Promise<IAuthDocument | null> {
    const query = { username: username.toLowerCase() };

    const user = await AuthModel.findOne(query);

    return user;
  }

  public async getByEmail(email: string): Promise<IAuthDocument | null> {
    const query = {
      email: email.toLowerCase()
    };

    const user = await AuthModel.findOne(query);

    return user;
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

    const user = await AuthModel.findOne(query);

    return user;
  }
}

export const authRepository: AuthRepository = new AuthRepository();
