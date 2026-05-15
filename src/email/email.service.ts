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

  async sendResultsEmail(
    to: string,
    overallScore: number,
    categoryScores: Record<string, number>,
    mobility: any,
    benchmarkCode: string,
    assignedBadge: string,
    assignedMessage: string,
    categorySuggestions: Record<string, string>,
  ) {
    try {
      // Dinamičko kreiranje sekcije sa kategorijama i predlozima
      let categoriesHtml = '';
      for (const [category, score] of Object.entries(categoryScores)) {
        const suggestion =
          categorySuggestions[category] ||
          'Nemamo specifičan predlog za ovu kategoriju trenutno.';

        categoriesHtml += `
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">
              <h4 style="margin: 0; font-size: 20px; color: #1e3a8a;">
                ${category} 
                <span style="float: right; color: #10b981; font-weight: bold;">${score.toFixed(2)} / 5.00</span>
              </h4>
            </div>
            <h5 style="margin: 0 0 10px 0; font-size: 16px; color: #1e3a8a;">Predlog:</h5>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
              ${suggestion}
            </p>
          </div>
        `;
      }

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: to,
        subject: 'Tvoj profil održivosti - Rezultati ankete',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 20px 10px; color: #333;">
            <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff;">
              
              <!-- TOP SECTION (My Eco Profile) -->
              <div style="background-color: #f9fafb; padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                
                <!-- Badge Card -->
                <div style="display: inline-block; background-color: #ffffff; border: 4px solid #10b981; border-radius: 16px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 24px; min-width: 250px;">
                  <p style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #1e3a8a;">Tvoj Eko Profil</p>
                  
                  <!-- Placeholder za sliku (Zameniti src apsolutnim URL-om kada bude spremno) -->
                  <img src="https://via.placeholder.com/120x120.png?text=Globe+Icon" alt="Eco Globe" style="width: 120px; height: 120px; margin: 0 auto 15px auto; display: block; border: 0;" />
                  
                  <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981; text-align: center;">${assignedBadge}</p>
                </div>

                <p style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #1e3a8a;">
                  Tvoj ukupan rezultat je: <span style="font-weight: bold; color: #10b981;">${overallScore.toFixed(2)}</span>
                </p>

                <!-- Description -->
                <div style="text-align: left; background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #1e3a8a;">Opis</h3>
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    ${assignedMessage}
                  </p>
                </div>
              </div>

              <!-- BOTTOM SECTION (What should you do next) -->
              <div style="background-color: #f5f5f5; padding: 40px 20px; border-radius: 12px;">
                <h2 style="margin: 0 0 20px 0; font-size: 26px; font-weight: bold; color: #1e3a8a;">Šta bi trebalo da uradiš sledeće?</h2>
                <hr style="border: 0; border-top: 1px solid #d1d5db; margin-bottom: 30px;" />
                
                <!-- Lista kategorija -->
                <div>
                  ${categoriesHtml}
                </div>
              </div>

              <!-- Footer info -->
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Vaš benchmarking kod: <strong>${benchmarkCode}</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                  <em>Napomena: Ovi rezultati služe isključivo za naučno-istraživačke svrhe.</em>
                </p>
              </div>

            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Mejl uspešno poslat na ${to} (Message ID: ${info.messageId})`,
      );
    } catch (error) {
      this.logger.error(`Greška pri slanju mejla na ${to}:`, error);
    }
  }
}
