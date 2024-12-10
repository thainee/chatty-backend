import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

class AuthService {
  public async getUserByUsername(
    username: string
  ): Promise<IAuthDocument | null> {
    const query = { username: username.toLowerCase() };

    const user = await AuthModel.findOne(query);

    return user;
  }

  public async getUserByEmail(email: string): Promise<IAuthDocument | null> {
    const query = {
      email: email.toLowerCase()
    };

    const user = await AuthModel.findOne(query);

    return user;
  }
}

export const authService: AuthService = new AuthService();
