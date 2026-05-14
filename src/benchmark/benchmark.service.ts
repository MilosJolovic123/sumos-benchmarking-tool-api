import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument } from '../schemas/result.schema';

@Injectable()
export class BenchmarkService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async compareResults(myCode: string, otherCode: string) {
    if (typeof myCode !== 'string' || typeof otherCode !== 'string') {
      throw new BadRequestException(
        'Invalid input: Benchmark codes must be textual.',
      );
    }

    if (myCode.trim() === '' || otherCode.trim() === '') {
      throw new BadRequestException(
        'Invalid input: Benchmark codes cannot be empty.',
      );
    }

    if (myCode === otherCode) {
      throw new BadRequestException(
        'Invalid input: You cannot compare the same benchmark code to itself.',
      );
    }

    if (!myCode || !otherCode) {
      throw new BadRequestException(
        'Invalid input: Both benchmark codes are required.',
      );
    }

    // Tražimo oba rezultata istovremeno (brže je nego jedan po jedan)
    const [myResult, otherResult] = await Promise.all([
      this.resultModel.findOne({ benchmarkCode: myCode }).exec(),
      this.resultModel.findOne({ benchmarkCode: otherCode }).exec(),
    ]);

    if (!myResult) {
      throw new NotFoundException(
        `Your result (code: ${myCode}) was not found in the database.`,
      );
    }

    if (!otherResult) {
      throw new NotFoundException(
        `Result for comparison (code: ${otherCode}) was not found in the database.`,
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
