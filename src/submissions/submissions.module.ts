import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from '../schemas/submission.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { EmailModule } from '../email/email.module';
import { SubmissionsService } from './submission.service';
import { SubmissionsController } from './submissions.controller';
import { Result, ResultSchema } from 'src/schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    EmailModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
