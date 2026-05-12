import { Controller, Post, Body } from '@nestjs/common';
import { SubmissionsService } from './submission.service';

@Controller('api/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async submitSurvey(@Body() body: any) {
    return this.submissionsService.processSubmission(body);
  }
}
