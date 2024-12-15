import fs from 'fs';
import ejs from 'ejs';
import path from 'path';

class PasswordResetRequestTemplate {
  public create(username: string, resetLink: string): string {
    const filePath = path.join(
      __dirname,
      'password-reset-request.template.ejs'
    );
    return ejs.render(fs.readFileSync(filePath, 'utf8'), {
      username,
      resetLink,
      image_url: 'https://www.chatty.com/assets/logo.png'
    });
  }
}

export const passwordResetRequestTemplate = new PasswordResetRequestTemplate();
