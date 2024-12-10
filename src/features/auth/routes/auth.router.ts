import { signUpController } from '@auth/controllers/signup';
import express, { Router } from 'express';

class AuthRouter {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', signUpController.createUser);

    return this.router;
  }
}

export const authRouter: AuthRouter = new AuthRouter();
