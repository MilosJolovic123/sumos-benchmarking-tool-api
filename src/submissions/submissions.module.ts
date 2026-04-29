import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from '../schemas/submission.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { EmailModule } from '../email/email.module';
import { SubmissionsService } from './submission.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
    EmailModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}