import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('get-stats')
  @HttpCode(HttpStatus.OK)
  async getDashboard() {
    return await this.statisticsService.getDashboardStats();
  }
}
