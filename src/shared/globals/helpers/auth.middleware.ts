import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '@globals/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';

class AuthMiddleWare {
  public verifyToken(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new UnauthorizedError('Session expired. Please log in again.');
    }

    try {
      const payload: AuthPayload = jwt.verify(
        req.session.jwt,
        config.JWT_SECRET
      ) as AuthPayload;

      req.currentUser = payload;
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid token. Please log in again.');
    }
  }
}

export const authMiddleware = new AuthMiddleWare();
