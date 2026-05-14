import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument } from '../schemas/result.schema';

@Injectable()
export class BenchmarkService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async compareResults(myCode: string, otherCode: string) {
    if (!myCode || !otherCode) {
      throw new Error(
        'Oba koda (myBenchmarkCode i otherBenchmarkCode) su obavezna.',
      );
    }

    // Tražimo oba rezultata istovremeno (brže je nego jedan po jedan)
    const [myResult, otherResult] = await Promise.all([
      this.resultModel.findOne({ benchmarkCode: myCode }).exec(),
      this.resultModel.findOne({ benchmarkCode: otherCode }).exec(),
    ]);

    if (!myResult) {
      throw new NotFoundException(
        `Tvoj rezultat (kod: ${myCode}) nije pronađen u bazi.`,
      );
    }

    if (!otherResult) {
      throw new NotFoundException(
        `Rezultat za upoređivanje (kod: ${otherCode}) nije pronađen u bazi.`,
      );
    }

    // Vraćamo čist objekat sa podacima, bez osetljivih stvari poput emaila
    return {
      myData: {
        ecoScore: myResult.ecoScore,
        categoryScores: myResult.categoryScores,
        mobility: myResult.mobility,
      },
      otherData: {
        ecoScore: otherResult.ecoScore,
        categoryScores: otherResult.categoryScores,
        mobility: otherResult.mobility,
      },
    };
  }
}
