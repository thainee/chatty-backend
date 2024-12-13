import { LogIn } from '@auth/controllers/login';
import { LogOut } from '@auth/controllers/logout';
import { SignUp } from '@auth/controllers/signup';
import express, { Router } from 'express';

export class AuthRouter {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.signUp);
    this.router.post('/login', LogIn.prototype.logIn);

    return this.router;
  }

  public logoutRoute(): Router {
    this.router.get('/logout', LogOut.prototype.logOut);

    return this.router;
  }
}

export const authRouter: AuthRouter = new AuthRouter();
