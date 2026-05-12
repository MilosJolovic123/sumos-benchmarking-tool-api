import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CountriesService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCountryNames(): Promise<string[]> {
    const cacheKey = 'COUNTRIES_LIST';
    
    const cachedCountries = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedCountries) {
      return cachedCountries;
    }

    const url = 'https://restcountries.com/v3.1/all?fields=name';
    const { data } = await lastValueFrom(this.httpService.get(url));

    const countries = data
      .map((country: any) => country.name.common)
      .sort((a: string, b: string) => a.localeCompare(b));

    await this.cacheManager.set(cacheKey, countries, 86400000);

    return countries;
  }
}