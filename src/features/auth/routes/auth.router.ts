import { signUp } from '@auth/controllers/signup';
import express, { Router } from 'express';

export class AuthRouter {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/signup', signUp.createUser);
  }

  public routes(): Router {
    return this.router;
  }
}

export const authRouter: AuthRouter = new AuthRouter();
