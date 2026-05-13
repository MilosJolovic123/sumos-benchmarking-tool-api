import { Controller, Get } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('api/questions') // Definišemo putanju direktno na nivou domene
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions() {
    return this.questionsService.findAll();
  }
}