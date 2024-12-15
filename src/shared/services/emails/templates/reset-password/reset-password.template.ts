import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public resetPasswordTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;
    const filePath = path.join(__dirname, 'reset-password.template.ejs');
    return ejs.render(fs.readFileSync(filePath, 'utf8'), {
      username,
      email,
      ipaddress,
      date,
      image_url:
        'https://i0.wp.com/picjumbo.com/wp-content/uploads/gorgeous-sunset-over-the-sea-free-image.jpeg?h=800&quality=80'
    });
  }
}

export const resetPasswordTemplate = new ResetPasswordTemplate();
