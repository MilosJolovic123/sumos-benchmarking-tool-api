import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { BenchmarkService } from './benchmark.service';
import { BenchmarkController } from './benchmark.controller';
import { Result, ResultSchema } from 'src/schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  providers: [BenchmarkService],
  controllers: [BenchmarkController],
})
export class BenchmarkModule {}
