import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 86400000, // Cache duration in seconds (1 hour)
      max: 100, // Maximum number of items in cache
    }),
  ],
  providers: [CountriesService],
  controllers: [],
  exports: [CountriesService], //Export servisa nisam siguran za sada da li ce trebati u ostalim delovima aplikacije.
})
export class CountriesModule {}
