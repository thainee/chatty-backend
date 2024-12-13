import { LogIn } from '@auth/controllers/login';
import { SignUp } from '@auth/controllers/signup';
import express, { Router } from 'express';

export class AuthRouter {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/signup', SignUp.prototype.signUp);
    this.router.post('/login', LogIn.prototype.logIn);
  }

  public routes(): Router {
    return this.router;
  }
}

export const authRouter: AuthRouter = new AuthRouter();
