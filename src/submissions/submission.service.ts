import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { scoringConfig } from './scoring.config';
import { EmailService } from '../email/email.service';
import { ResultDocument } from 'src/schemas/result.schema';
import { feedbackConfig } from './feedback.config';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel('Result')
    private resultModel: Model<ResultDocument>,
    private emailService: EmailService,
  ) {}

  async processSubmission(payload: any) {
    const { email, completionTimeSeconds, isRealAttempt, answers } = payload;

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
    const institutionMapValue =
      answersMap['study_status_university'] || 'Unknown';
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
      questionText:
        ans.questionText || questionMap.get(ans.questionKey)?.text || 'Unknown',
      category:
        ans.category ||
        questionMap.get(ans.questionKey)?.category ||
        'Uncategorized',
      questionVersion: ans.questionVersion || 1,
      value: ans.value,
    }));

    // 6. Kalkulacija rezultata (SADA PROSLEĐUJEMO answersMap)
    const scores = this.calculateScores(answersMap);

    //6.1 Kalkulacija koda za benchmarking i perzistencija u bazi - sada sa mehanizmom ponovnog pokušaja u slučaju kolizije koda
    let newSubmission = new this.submissionModel({
      state: state,
      institution: institutionMapValue,
      questionnaireVersion: 1,
      email: email || 'test-email@test.com',
      mobilityDone: mobilityDone,
      answers: structuredAnswers,
      isRealAttempt: isRealAttempt || false,
    });

    const MAX_RETRIES = 5;
    let isSaved = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        newSubmission.benchmarkCode = this.generateBenchmarkingCode();

        await newSubmission.save();

        isSaved = true;
        break;
      } catch (error) {
        const mongoError = error as any;

        const isCollision =
          mongoError.code === 11000 &&
          (mongoError.keyPattern?.benchmarkCode ||
            mongoError.keyPattern?.benchmarkingCode);

        if (isCollision) {
          console.warn(
            `Pokušaj ${attempt + 1}: Kolizija koda, pokušavam ponovo...`,
          );
          continue;
        }

        throw error;
      }
    }
    if (!isSaved) {
      throw new Error(
        'Sistem nije uspeo da generiše jedinstven benchmarking kod nakon 5 pokušaja.',
      );
    }

    this.logger.log(`Prijava perzistirana u MongoDB. ID: ${newSubmission._id}`);

    // Određivanje Bedža (My Eco Profile)
    let assignedBadge = feedbackConfig.overall[0].badge;
    let assignedMessage = feedbackConfig.overall[0].message;
    for (const level of feedbackConfig.overall) {
      if (scores.ecoScore <= level.maxScore) {
        assignedBadge = level.badge;
        assignedMessage = level.message;
        break;
      }
    }

    const newResult = new this.resultModel({
      submissionId: newSubmission._id,
      isRealAttempt: newSubmission.isRealAttempt,
      email: newSubmission.email,
      benchmarkCode: newSubmission.benchmarkCode,
      ecoScore: scores.ecoScore,
      categoryScores: scores.categoryScores,
      mobility: scores.mobility,
      badge: assignedBadge,
      completionTimeSeconds: completionTimeSeconds || 0,
      state: newSubmission.state,
      institution: institutionMapValue,
    });
    await newResult.save();

    // Određivanje sugestija po kategorijama
    const categorySuggestions: Record<string, string> = {};
    for (const category in scores.categoryScores) {
      const catScore = scores.categoryScores[category];
      const levels =
        feedbackConfig.categories[
          category as keyof typeof feedbackConfig.categories
        ];

      if (levels && Array.isArray(levels)) {
        for (const lvl of levels) {
          if (catScore <= lvl.maxScore) {
            categorySuggestions[category] = lvl.message;
            break;
          }
        }
      }
    }

    if (email) {
      this.emailService.sendResultsEmail(
        email,
        scores.ecoScore,
        scores.categoryScores,
        scores.mobility,
        newSubmission.benchmarkCode,
        assignedBadge,
        assignedMessage,
        categorySuggestions,
      );
    }

    return {
      message: 'Survey completed successfully!',
      result: {
        scores: {
          ecoScore: scores.ecoScore,
          categoryScores: scores.categoryScores,
          mobility: scores.mobility,
        },
        feedback: {
          badge: assignedBadge,
          message: assignedMessage,
          suggestions: categorySuggestions,
        },
      },
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

  private calculateScores(answers: Record<string, any>) {
    // 1. Priprema strukture za sakupljanje zbirova po kategorijama
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    // 2. Parsiranje svih odgovora koristeći config
    for (const kljuc in answers) {
      const config = scoringConfig[kljuc];
      if (!config) {
        // Nema configa, preskačemo pitanje (npr. demografija)
        continue;
      }

      const answer = answers[kljuc];
      if (answer == null) continue; // Preskakanje praznih odgovora

      // Slučaj A: String mapiran preko valueMap
      if (typeof answer === 'string' && config.valueMap) {
        const score = config.valueMap[answer];
        if (score !== undefined) {
          this.addToCategory(categoryTotals, config.category, score);
        }
      }
      // Slučaj B: Standardni broj (Likert)
      else if (typeof answer === 'number') {
        const score = config.reverse ? 6 - answer : answer;
        this.addToCategory(categoryTotals, config.category, score);
      }
      // Slučaj C: Matrice i Rubrike (Objekti sa podključevima)
      else if (
        typeof answer === 'object' &&
        !Array.isArray(answer) &&
        (config.isMatrix || config.isRubric)
      ) {
        for (const subKey in answer) {
          const subAnswer = answer[subKey];
          if (typeof subAnswer === 'number') {
            const isReverse = config.reverseKeys?.includes(subKey);
            const subScore = isReverse ? 6 - subAnswer : subAnswer;
            // Za matrice, sve ide u glavnu kategoriju iz configa (npr. 'Travel' ili 'Mobility_Pre')
            this.addToCategory(categoryTotals, config.category, subScore);
          }
        }
      }
    }

    // 3. Računanje PROSEKA za svaku kategoriju ponaosob
    const categoryScores: Record<string, number> = {};
    for (const cat in categoryTotals) {
      if (categoryTotals[cat].count > 0) {
        categoryScores[cat] =
          categoryTotals[cat].sum / categoryTotals[cat].count;
      }
    }
    const habitCategories = [
      'Travel',
      'Living',
      'Consumption',
      'Digital',
      'Engagement',
    ];
    let habitsSum = 0;
    let habitsCount = 0;

    habitCategories.forEach((cat) => {
      if (categoryScores[cat] !== undefined) {
        habitsSum += categoryScores[cat];
        habitsCount++;
      }
    });

    if (habitsCount > 0) {
      // Ubacujemo prosek navika direktno u isti objekat gde su i ostale kategorije!
      categoryScores['Habits'] = parseFloat(
        (habitsSum / habitsCount).toFixed(2),
      );
    }
    // 4. Računanje glavnog ECO SCORE-a prema formuli iz dokumenta
    // Eco Score = (Awareness + Attitudes + Travel + Living + Consumption + Digital + Engagement) / 7
    const ecoCategories = [
      'Awareness',
      'Attitudes',
      'Travel',
      'Living',
      'Consumption',
      'Digital',
      'Engagement',
    ];
    let ecoScoreSum = 0;
    let ecoScoreCount = 0;

    ecoCategories.forEach((cat) => {
      if (categoryScores[cat] !== undefined) {
        ecoScoreSum += categoryScores[cat];
        ecoScoreCount++;
      }
    });

    // Ako neka kategorija u potpunosti nedostaje iz odgovora (što ne bi smelo),
    // delimo samo sa brojem postojećih kategorija kako ne bismo uništili prosek
    const finalEcoScore = ecoScoreCount > 0 ? ecoScoreSum / ecoScoreCount : 0;

    // 5. Računanje MOBILITY SCORE-ova i DELTI [cite: 154-175]
    const preScore = categoryScores['Mobility_Pre'];
    const duringScore = categoryScores['Mobility_During'];
    const afterScore = categoryScores['Mobility_After'];

    let overallMobility = 0;
    let delta1 = 0; // During - Pre [cite: 165]
    let delta2 = 0; // After - During [cite: 170]
    let delta3 = 0; // After - Pre [cite: 175]

    // Overall Mobility = (Pre + During + After) / 3 [cite: 163]
    if (
      preScore !== undefined &&
      duringScore !== undefined &&
      afterScore !== undefined
    ) {
      overallMobility = (preScore + duringScore + afterScore) / 3;
    }

    // Deltas
    if (preScore !== undefined && duringScore !== undefined) {
      delta1 = duringScore - preScore;
    }
    if (duringScore !== undefined && afterScore !== undefined) {
      delta2 = afterScore - duringScore;
    }
    if (preScore !== undefined && afterScore !== undefined) {
      delta3 = afterScore - preScore;
    }

    // 6. Sklapanje konačnog rezultata
    return {
      ecoScore: parseFloat(finalEcoScore.toFixed(2)),
      categoryScores, // Ovo ćeš koristiti za crtanje grafikona na frontu
      mobility: {
        pre: preScore || null,
        during: duringScore || null,
        after: afterScore || null,
        overall:
          overallMobility !== null
            ? parseFloat(overallMobility.toFixed(2))
            : null,
        delta1: delta1 !== null ? parseFloat(delta1.toFixed(2)) : null,
        delta2: delta2 !== null ? parseFloat(delta2.toFixed(2)) : null,
        delta3: delta3 !== null ? parseFloat(delta3.toFixed(2)) : null,
      },
    };
  }

  private addToCategory(
    totals: Record<string, { sum: number; count: number }>,
    category: string,
    score: number,
  ) {
    if (!totals[category]) totals[category] = { sum: 0, count: 0 };
    totals[category].sum += score;
    totals[category].count += 1;
  }
}
