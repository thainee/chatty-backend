import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import { promisify } from 'util';
import { format } from 'date-fns';
import ip from 'ip';

import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { config } from '@root/config';
import { authRepository } from '@services/db/auth.repository';
import { BadRequestError } from '@globals/helpers/error-handler';
import { emailSchema, passwordSchema } from '@auth/validators/password.joi';
import { emailQueue } from '@services/queues/email.queue';
import { passwordResetRequestTemplate } from '@services/emails/templates/password-reset-request/password-reset-request.template';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { passwordChangedConfirmationTemplate } from '@services/emails/templates/password-changed-confimation/password-changed-confirmation.template';

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

    emailQueue.addEmailJob('passwordResetEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password'
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password reset request email sent' });
  }

  @joiValidation(passwordSchema)
  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { password } = req.body;
    const { token } = req.query;
    if (!token) {
      throw new BadRequestError('Invalid or expired token');
    }

    const existingAuth = await authRepository.getByPasswordResetToken(token);

    if (!existingAuth) {
      throw new BadRequestError('Invalid or expired token');
    }

    existingAuth.password = password;
    existingAuth.passwordResetToken = undefined;
    existingAuth.passwordResetExpires = undefined;

    await existingAuth.save();

    const templateParams: IResetPasswordParams = {
      username: existingAuth.username,
      email: existingAuth.email,
      ipaddress: ip.address(),
      date: format(new Date(), 'dd/MM/yyyy HH:mm')
    };
    const template = passwordChangedConfirmationTemplate.create(templateParams);

    emailQueue.addEmailJob('passwordResetEmail', {
      template,
      receiverEmail: existingAuth.email,
      subject: 'Password changed confirmation'
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password successfully updated.' });
  }
}
