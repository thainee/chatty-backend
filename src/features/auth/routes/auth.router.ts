import express, { Router } from 'express';
import { CurrentUser } from '@auth/controllers/current-user';
import { LogIn } from '@auth/controllers/login';
import { LogOut } from '@auth/controllers/logout';
import { SignUp } from '@auth/controllers/signup';
import { authMiddleware } from '@globals/helpers/auth.middleware';

export class AuthRouter {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.signUp);
    this.router.post('/login', LogIn.prototype.logIn);

    this.router.use(authMiddleware.verifyToken);
    this.router.get('/logout', LogOut.prototype.logOut);
    this.router.get('/current-user', CurrentUser.prototype.get);
    return this.router;
  }
}

export const authRouter: AuthRouter = new AuthRouter();
