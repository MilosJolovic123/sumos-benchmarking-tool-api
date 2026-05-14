import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendResultsEmail(to: string, overallScore: number, categoryScores: Record<string, number>, benchmarkCode: string) {
    try {
      
      let categoriesHtml = '';
      for (const [category, score] of Object.entries(categoryScores)) {
        categoriesHtml += `<li><strong>${category}:</strong> ${score.toFixed(2)} / 5.00</li>`;
      }

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: to,
        subject: 'Vaš profil održivosti - Rezultati ankete',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">Hvala Vam na učešću u istraživanju!</h2>
            <p>Uspešno smo zabeležili Vaše odgovore. Na osnovu Vaših navika, stavova i prepreka, izračunali smo Vaš profil održivosti.</p>
            <p>Vaš benchmarking kod: <strong>${benchmarkCode}</strong></p>
            <div style="background-color: #f4fdf4; padding: 20px; border-radius: 8px; border-left: 5px solid #2E8B57; margin: 20px 0;">
              <h3 style="margin-top: 0;">Ukupan Eko-Skor: <span style="font-size: 24px; color: #2E8B57;">${overallScore.toFixed(2)}</span> / 5.00</h3>
            </div>

            <h4>Rezultati po kategorijama:</h4>
            <ul>
              ${categoriesHtml}
            </ul>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <em>Napomena: Ovi rezultati služe isključivo za naučno-istraživačke svrhe u okviru analize uticaja mobilnosti studenata na održive navike.</em>
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Mejl uspešno poslat na ${to} (Message ID: ${info.messageId})`);
    } catch (error) {
      this.logger.error(`Greška pri slanju mejla na ${to}:`, error);
    }
  }
}