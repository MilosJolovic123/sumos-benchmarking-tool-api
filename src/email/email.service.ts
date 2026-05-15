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

  private fmt(n: number): string {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  private getScoreColor(score: number): string {
    const pct = score / 5;
    if (pct >= 0.8) return '#64a550';
    if (pct >= 0.6) return '#A3C27C';
    if (pct >= 0.4) return '#455369';
    if (pct >= 0.21) return '#D89B39';
    return '#DC493A';
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
      let categoriesHtml = '';
      const excludedCategories = [
        'Barriers',
        'Mobility_Pre',
        'Mobility_During',
        'Mobility_After',
        'Habits',
      ];

      const categoryLabels: Record<string, string> = {
        Awareness: 'Awareness',
        Attitudes: 'Attitudes',
        Travel: 'Travel Habits',
        Living: 'Living and Accommodation',
        Consumption: 'Buying and Consumption',
        Digital: 'Digital Habits',
        Engagement: 'Community Engagement',
      };

      for (const [key, score] of Object.entries(categoryScores)) {
        if (excludedCategories.includes(key)) continue;

        const label = categoryLabels[key] || key;
        const color = this.getScoreColor(score);
        const suggestion =
          categorySuggestions[key] || 'No specific recommendations.';
        const barWidth = (score / 5) * 100;

        categoriesHtml += `
          <div style="margin-bottom: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size: 18px; font-weight: bold; color: #233662; padding-bottom: 8px;">
                  ${label}
                </td>
                <td align="right" style="font-size: 18px; font-weight: bold; color: ${color};">
                  ${this.fmt(score)} <span style="color: #bfbfbf; font-size: 14px;">/ 5</span>
                </td>
              </tr>
            </table>
            <div style="background-color: #f0f0f0; border-radius: 4px; height: 10px; width: 100%; margin-bottom: 15px;">
              <div style="background-color: ${color}; height: 10px; border-radius: 4px; width: ${barWidth}%;"></div>
            </div>
            <p style="font-size: 15px; color: #455369; line-height: 1.5; margin: 0;">
              <strong>Recommendation:</strong> ${suggestion}
            </p>
          </div>
        `;
      }

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: to,
        subject: 'Your SuMoS Sustainability Profile - Results',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @media screen and (max-width: 600px) {
                .stack-column {
                  display: block !important;
                  width: 100% !important;
                  padding-right: 0 !important;
                  padding-left: 0 !important;
                  box-sizing: border-box !important;
                }
                .mobile-margin {
                  margin-bottom: 20px !important;
                }
                .container {
                  padding: 10px !important;
                }
              }
            </style>
          </head>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;" class="container">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              
              <tr>
                <td style="background-color: #ffffff; padding: 40px 40px 20px 40px; border-bottom: 1px solid #f0f0f0;">
                  <h1 style="color: #233662; margin: 0; font-size: 28px; font-weight: bold;">Your Detailed Results</h1>
                  <p style="color: #455369; font-size: 16px; margin-top: 10px;">SuMoS - Students' Green Awareness and Sustainable Habits</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="stack-column mobile-margin" width="50%" style="vertical-align: top; padding-right: 20px;">
                         <div style="border: 4px solid #64a550; border-radius: 12px; padding: 30px; text-align: center; background-color: #ffffff;">
                            <p style="font-size: 18px; font-weight: bold; color: #233662; margin-bottom: 15px;">My Green Profile</p>
                            <div style="font-size: 26px; font-weight: bold; color: #64a550; margin-bottom: 10px;">${assignedBadge}</div>
                            <div style="font-size: 14px; color: #233662;">Overall Score:</div>
                            <div style="font-size: 36px; font-weight: bold; color: #64a550;">${this.fmt(overallScore)}</div>
                         </div>
                      </td>
                      <td class="stack-column" width="50%" style="vertical-align: middle;">
                        <h3 style="color: #233662; font-size: 20px; margin-bottom: 10px;">Profile Description</h3>
                        <p style="color: #455369; font-size: 16px; line-height: 1.6; margin: 0;">
                          ${assignedMessage}
                        </p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f9f8d6; border-radius: 6px; text-align: center; border: 1px solid #e6e4a8;">
                          <p style="font-size: 14px; color: #233662; margin: 0 0 5px 0;">Benchmarking code:</p>
                          <strong style="font-size: 24px; color: #233662; letter-spacing: 2px;">${benchmarkCode}</strong>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px;">
                  <h2 style="color: #233662; border-bottom: 2px solid #64a550; padding-bottom: 10px; margin-bottom: 30px;">What should you do next?</h2>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  ${categoriesHtml}
                </td>
              </tr>

              <tr>
                <td style="background-color: #233662; padding: 30px; text-align: center;">
                  <p style="color: #ffffff; font-size: 14px; margin: 0;">
                    This email is automatically generated by the SuMoS platform.
                  </p>
                  <p style="color: #A3C27C; font-size: 12px; margin-top: 10px;">
                    © 2026 SuMoS Benchmarking tool - FOI
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}:`, error);
    }
  }
}
