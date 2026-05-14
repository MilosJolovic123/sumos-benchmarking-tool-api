import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { SeedService } from './seed/seed.service';
import { QuestionsModule } from './questions/questions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubmissionsModule } from './submissions/submissions.module';
import { EmailModule } from './email/email.module';
import { Question, QuestionSchema } from './schemas/question.schema';
import { CountriesModule } from './countries/countries.module';
import { BenchmarkModule } from './benchmark/benchmark.module';

@Module({
  imports: [ConfigModule.forRoot({
  isGlobal: true,
}),
MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), 
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    QuestionsModule,
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    SubmissionsModule,
    EmailModule,
    CountriesModule,
    BenchmarkModule
  ],
  controllers: [],
  providers: [SeedService],
})
export class AppModule {}
