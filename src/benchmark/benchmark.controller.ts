import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BenchmarkService } from './benchmark.service';

@Controller('api/benchmark')
export class BenchmarkController {
  constructor(private readonly benchmarkService: BenchmarkService) {}

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  async compare(
    // Frontend ti šalje JSON: { "myBenchmarkCode": "ABC", "otherBenchmarkCode": "XYZ" }
    @Body('myBenchmarkCode') myCode: string,
    @Body('otherBenchmarkCode') otherCode: string,
  ) {
    return this.benchmarkService.compareResults(myCode, otherCode);
  }
}
