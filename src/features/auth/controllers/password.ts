import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import { promisify } from 'util';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { config } from '@root/config';
import { authRepository } from '@services/db/auth.repository';
import { BadRequestError } from '@globals/helpers/error-handler';
import { emailSchema } from '@auth/validators/password.joi';
import { emailQueue } from '@services/queues/email.queue';
import { passwordResetRequestTemplate } from '@services/emails/templates/password-reset-request/password-reset-request.template';

export class Password {
  @joiValidation(emailSchema)
  public async sendPasswordResetRequestEmail(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email } = req.body;
    const existingAuth = await authRepository.getByEmail(email);

    if (!existingAuth) {
      throw new BadRequestError('Email not found');
    }

    const randomBytesAsync = promisify(crypto.randomBytes);
    const randomBytes = await randomBytesAsync(20);
    const randomChars = randomBytes.toString('hex');

    await authRepository.updatePasswordResetToken(
      `${existingAuth._id}`,
      randomChars,
      Date.now() + 60 * 60 * 1000
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomChars}`;
    const template = passwordResetRequestTemplate.create(
      existingAuth.username,
      resetLink
    );

    emailQueue.addEmailJob('passwordResetRequest', {
      template,
      receiverEmail: email,
      subject: 'Reset your password'
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password reset request email sent' });
  }
}
