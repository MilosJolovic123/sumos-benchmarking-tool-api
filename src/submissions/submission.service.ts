import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { scoringConfig } from './scoring.config';
import { EmailService } from '../email/email.service';
//ovde treba ostaviti i dokument kojim ce se upisivati direktno rezultati jednog ispitanika - moraju imati kod a pozeljno i mejl
//da bi se lakse cupali kasnije za benchmark i tips and tricks
@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private emailService: EmailService,
  ) {}

  async processSubmission(payload: any) {
    const { email, odgovori } = payload;

    // 1. Dobavljamo sva pitanja iz baze kako bismo mapirali 'key' u 'text' i 'category'
    const allQuestions = await this.questionModel.find().exec();
    const questionMap = new Map();
    allQuestions.forEach((q) => {
      questionMap.set(q.key, { text: q.text, category: q.category });
    });

    // 2. Mapiranje institucije i države
    // Ovo treba remapirati sa pitanjem iz koje drzave dolazite
    const institution = 'Unknown';
    //const institution = odgovori['study_status_university'] || 'Unknown';
    const state = this.determineState(institution);

    // 3. Mapiranje statusa mobilnosti
    const exchangeStatus = odgovori['exchange_status'] || '';
    const mobilityDone =
      exchangeStatus.includes('Yes') || exchangeStatus.includes('currently');

    // 4. Transformacija ravnog 'odgovori' objekta Answer[] niz
    const structuredAnswers: {
      questionKey: string;
      questionText: string;
      category: string;
      questionVersion: number;
      value: any;
    }[] = [];

    for (const [key, value] of Object.entries(odgovori)) {
      const qInfo = questionMap.get(key) || {
        text: 'Unknown/Custom Question',
        category: 'Uncategorized',
      };

      structuredAnswers.push({
        questionKey: key,
        questionText: qInfo.text,
        category: qInfo.category,
        questionVersion: 1,
        value: value,
      });
    }

    // 5. Kalkulacija rezultata
    const scores = this.calculateScores(odgovori);

    // 6. Kreiranje dokumenta
    const newSubmission = new this.submissionModel({
      state: state,
      institution: institution,
      questionnaireVersion: 1,
      email: email || 'test-email@test.com',
      mobilityDone: mobilityDone,
      answers: structuredAnswers,
    });

    await newSubmission.save();
    this.logger.log(`Prijava perzistirana u MongoDB. ID: ${newSubmission._id}`);

    // 7. Slanje mejla
    if (email) {
      this.emailService.sendResultsEmail(
        email,
        scores.overallScore,
        scores.categoryScores,
      );
    }

    // 8. Vraćanje rezultata
    return {
      message:
        'Prijava je uspešna, rezultati su sačuvani po novoj strukturi i poslati na mejl.',
      submissionId: newSubmission._id,
      results: scores,
    };
  }

  // Pomoćna funkcija za dodeljivanje države na osnovu izabranog univerziteta
  private determineState(university: string): string {
    if (university.includes('Zagreb')) return 'Croatia';
    if (university.includes('ESIEA')) return 'France';
    if (university.includes('Žilina')) return 'Slovakia';
    if (university.includes('Maribor')) return 'Slovenia';
    if (university.includes('Belgrade')) return 'Serbia';
    return 'Other';
  }

  private calculateScores(odgovori: any) {
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    for (const kljuc in odgovori) {
      const config = scoringConfig[kljuc];
      if (!config) continue;

      let answer = odgovori[kljuc];

      if (typeof answer === 'string' && config.valueMap) {
        const score = config.valueMap[answer];
        if (score !== undefined) {
          this.addToCategory(categoryTotals, config.category, score);
        }
      } else if (typeof answer === 'number') {
        const score = config.reverse ? 6 - answer : answer;
        this.addToCategory(categoryTotals, config.category, score);
      } else if (
        typeof answer === 'object' &&
        answer !== null &&
        (config.isMatrix || config.isRubric)
      ) {
        for (const subKey in answer) {
          const subAnswer = answer[subKey];
          if (typeof subAnswer === 'number') {
            const isReverse = config.reverseKeys?.includes(subKey);
            const subScore = isReverse ? 6 - subAnswer : subAnswer;
            const targetCategory = config.isRubric ? subKey : config.category;
            this.addToCategory(categoryTotals, targetCategory, subScore);
          }
        }
      }
    }

    const categoryScores = {};
    let totalSum = 0;
    let totalCount = 0;

    for (const cat in categoryTotals) {
      const avg = categoryTotals[cat].sum / categoryTotals[cat].count;
      categoryScores[cat] = avg;
      totalSum += categoryTotals[cat].sum;
      totalCount += categoryTotals[cat].count;
    }

    return {
      overallScore: totalCount > 0 ? totalSum / totalCount : 0,
      categoryScores,
    };
  }

  private addToCategory(totals: any, category: string, score: number) {
    if (!totals[category]) totals[category] = { sum: 0, count: 0 };
    totals[category].sum += score;
    totals[category].count += 1;
  }
}
