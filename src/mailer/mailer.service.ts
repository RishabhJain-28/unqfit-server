import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
@Injectable()
export class MailerService {
  private mailer: Transporter;
  constructor(config: ConfigService) {
    this.mailer = createTransport({
      from: config.get('EMAIL_FROM'),
      host: config.get('EMAIL_SERVICE_HOST'),
      port: config.get<number>('EMAIL_SERVICE_PORT'), //!SSL
      auth: {
        user: config.get('EMAIL_SERVICE_USER'),
        pass: config.get('EMAIL_SERVICE_PASS'),
      },
    });
  }

  sendMail(
    mailOptions: Omit<SendMailOptions, 'from'> & {
      to: string;
      subject: string;
      html: string;
    },
  ) {
    return this.mailer.sendMail({
      ...mailOptions,
    });
  }
}
