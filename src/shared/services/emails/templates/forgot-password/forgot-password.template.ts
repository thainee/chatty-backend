import fs from 'fs';
import ejs from 'ejs';
import path from 'path';

class ForgotPasswordTemplate {
  public forgotPasswordTemplate(username: string, resetLink: string): string {
    const filePath = path.join(__dirname, 'forgot-password.template.ejs');
    return ejs.render(fs.readFileSync(filePath, 'utf8'), {
      username,
      resetLink,
      image_url: 'https://www.chatty.com/assets/logo.png'
    });
  }
}

export const forgotPasswordTemplate = new ForgotPasswordTemplate();
