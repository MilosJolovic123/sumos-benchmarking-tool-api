import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { SeedService } from './seed/seed.service';
import { QuestionsModule } from './questions/questions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubmissionsModule } from './submissions/submissions.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), 
      }),
      inject: [ConfigService],
    }),
    QuestionsModule,
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    SubmissionsModule,
    EmailModule
  ],
  controllers: [],
  providers: [SeedService],
})
export class AppModule {}
