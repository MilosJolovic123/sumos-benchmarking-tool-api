import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { scoringConfig } from './scoring.config';
import { EmailService } from '../email/email.service';

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
    const { email, isRealAttempt, answers } = payload;

    if (!answers || !Array.isArray(answers)) {
      throw new Error("Missing 'answers' array in payload");
    }

    const answersMap: Record<string, any> = {};
    for (const ans of answers) {
      answersMap[ans.questionKey] = ans.value;
    }

    // 2. Dobavljamo sva pitanja iz baze
    const allQuestions = await this.questionModel.find().exec();
    const questionMap = new Map();
    allQuestions.forEach((q) => {
      questionMap.set(q.key, { text: q.text, category: q.category });
    });

    // 3. Mapiranje institucije i države
    const institutionMapValue = answersMap['study_status_university'] || 'Unknown';
   // const state = this.determineState(institutionMapValue);

    // 4. Mapiranje statusa mobilnosti (SADA KORISTI answersMap)
    const exchangeStatus = answersMap['exchange_status'] || '';
    const mobilityDone =
      typeof exchangeStatus === 'string' &&
      (exchangeStatus.includes('Yes') || exchangeStatus.includes('currently'));

    // 4.1. Mapiranje drzave 
    const stateAnswer = answersMap['demo_country'] || '';
    const state = typeof stateAnswer === 'string' ? stateAnswer : '';

    // 5. Transformacija (zadržavamo ono što ti već stiže u nizu, jer je frontend već formatirao!)
    const structuredAnswers = answers.map((ans) => ({
      questionKey: ans.questionKey,
      questionText: ans.questionText || questionMap.get(ans.questionKey)?.text || 'Unknown',
      category: ans.category || questionMap.get(ans.questionKey)?.category || 'Uncategorized',
      questionVersion: ans.questionVersion || 1,
      value: ans.value,
    }));

    // 6. Kalkulacija rezultata (SADA PROSLEĐUJEMO answersMap)
    const scores = this.calculateScores(answersMap);

    //6.1 Kalkulacija koda za benchmarking

    const benchCode = this.generateBenchmarkingCode();
    const bCode = typeof benchCode === 'string' ? benchCode : 'ERROR';

    // 7. Kreiranje dokumenta
    const newSubmission = new this.submissionModel({
      state: state,
      institution: institutionMapValue,
      questionnaireVersion: 1,
      email: email || 'test-email@test.com',
      mobilityDone: mobilityDone,
      answers: structuredAnswers,
      isRealAttempt: isRealAttempt || false,
      benchmarkCode: bCode,
    });

    await newSubmission.save();
    this.logger.log(`Prijava perzistirana u MongoDB. ID: ${newSubmission._id}`);

    if (email) {
      this.emailService.sendResultsEmail(
        email,
        scores.overallScore,
        scores.categoryScores,
        bCode,
      );
    }

    return {
      message: 'Prijava je uspešna, rezultati su sačuvani i poslati na mejl.',
      submissionId: newSubmission._id,
      results: scores,
    };
  }

  private generateBenchmarkingCode(length = 6): string {
  // Ne koriste se O, 0, 1, I, L - da bi se izbegla zabuna prilikom čitanja
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  if (length === 6) {
    return `${code.substring(0, 3)}-${code.substring(3, 6)}`;
  }
  return code;
}

  // Ažuriran naziv parametra da prati logiku (odgovori -> answers)
  private calculateScores(answers: any) {

    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    for (const kljuc in answers) {
      const config = scoringConfig[kljuc];
        if (!config) {
    console.log(`[SKIPPED] Nema configa za ključ: ${kljuc}`);
    continue;
  }

      let answer = answers[kljuc];
console.log(`[SCORING] Ključ: ${kljuc}, Vrednost:`, answer, `Tip:`, typeof answer);
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