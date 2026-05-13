import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private readonly countriesService: CountriesService, 
  ) {}

  async findAll() {
    const questions = await this.questionModel.find().select('-__v').lean().exec();

    const hydratedQuestions = await Promise.all(
      questions.map(async (question) => {
        if (question.key === 'demo_country') {
          question.options = await this.countriesService.getCountryNames();
        }
        
        return question;
      })
    );

    return hydratedQuestions;
  }
}